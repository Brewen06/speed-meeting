import time
import logging
from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.cors import CORSMiddleware

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware pour logger toutes les requêtes HTTP avec leur temps de traitement
    """
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Log de la requête entrante
        logger.info(f"Requête reçue: {request.method} {request.url.path}")
        
        try:
            response = await call_next(request)
            process_time = time.time() - start_time
            
            # Log de la réponse avec code de statut
            logger.info(
                f"Réponse: {request.method} {request.url.path} | "
                f"Status: {response.status_code} | "
                f"Temps: {process_time:.3f}s"
            )
            
            # Ajout du temps de traitement dans les headers
            response.headers["X-Process-Time"] = str(process_time)
            return response
            
        except Exception as e:
            process_time = time.time() - start_time
            logger.error(
                f"Erreur: {request.method} {request.url.path} | "
                f"Exception: {str(e)} | "
                f"Temps: {process_time:.3f}s"
            )
            raise


class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    """
    Middleware pour gérer les erreurs non capturées de manière centralisée
    """
    async def dispatch(self, request: Request, call_next):
        try:
            return await call_next(request)
        except ValueError as e:
            logger.warning(f"Erreur de validation: {str(e)}")
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "error": "Erreur de validation",
                    "detail": str(e),
                    "path": request.url.path
                }
            )
        except PermissionError as e:
            logger.warning(f"Erreur de permissions: {str(e)}")
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={
                    "error": "Accès refusé",
                    "detail": str(e),
                    "path": request.url.path
                }
            )
        except Exception as e:
            logger.error(f"Erreur serveur non gérée: {str(e)}", exc_info=True)
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "error": "Erreur interne du serveur",
                    "detail": "Une erreur inattendue s'est produite",
                    "path": request.url.path
                }
            )


def setup_middlewares(app):
    """
    Configure tous les middlewares de l'application
    """
    # CORS - doit être ajouté en premier
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # En production, spécifier les origines exactes
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Gestion des erreurs
    app.add_middleware(ErrorHandlingMiddleware)
    
    # Logging des requêtes
    app.add_middleware(RequestLoggingMiddleware)
    
    logger.info("Middlewares configurés avec succès")
