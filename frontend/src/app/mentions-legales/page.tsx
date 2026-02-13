'use client';

import React from "react";
import { ParticipantProtected } from "@/lib/protected-routes";

function MentionsLegales() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
                <div className="container">

                    <p>
                        Conformément à la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique,
                        notre site web créé par l’<strong>Agence Web WSF</strong>, propriétaire du site
                        <a href="https://www.long-island-factory.fr/" target="_blank" rel="noopener">https://www.long-island-factory.fr/</a>,
                        met à disposition du public les informations concernant notre entreprise :
                    </p>

                    <h2>Société</h2>
                    <div className="card">
                        <p><strong>LONG ISLAND FACTORY</strong><br />
                            Forme juridique : <strong>SASU – Société par actions simplifiée à associé unique</strong><br />
                            RCS : <strong>Caen B 883 134 306</strong><br />
                            Capital social : <strong>1 000 €</strong><br />
                            TVA intracommunautaire : <strong>FR26883134306</strong><br />
                            Adresse du siège social : <strong>1, rue Émile Desvaux, 14500 Vire, France</strong><br />
                            Directeur de la publication : <strong>M. Gérald BERTIN</strong> (via la société GLISCO – SIREN 882 696 198)<br />
                            Téléphone : <em>à compléter</em> – Mail : <em><a href="/cdn-cgi/l/email-protection" className="__cf_email__" data-cfemail="b4d3d1c6d5d8d0f4d8dbdad399ddc7d8d5dad099d2d5d7c0dbc6cd9ad2c6">[email&#160;protected]</a></em>
                        </p>
                    </div>

                    <h2>Prestataire technique</h2>
                    <div className="card">
                        <p>
                            Le présent site est la propriété de la société <strong>WSF</strong> en termes de conception technique, graphique, développement et maintenance.
                        </p>
                        <p>
                            Forme juridique : <strong>SARL</strong><br />
                            RCS CAEN : <strong>422 453 217</strong> – Code NAF/APE : <strong>6202A</strong><br />
                            Capital social : <strong>10 000 €</strong><br />
                            Siège social : <strong>1, rue Émile Desvaux, 14500 Vire-Normandie</strong><br />
                            Téléphone : <strong>02 31 67 74 75</strong><br />
                            Mail : <a href="/cdn-cgi/l/email-protection#d3b0bcbda7b2b0a793a4a0b5fdb5a1"><span className="__cf_email__" data-cfemail="482b27263c292b3c083f3b2e662e3a">[email&#160;protected]</span></a><br />
                            Site web : <a href="https://www.wsf.fr" target="_blank" rel="noopener">www.wsf.fr</a>
                        </p>
                    </div>

                    <h2>Hébergement</h2>
                    <p>Administration, gestion et maintenance de l’hébergement : <strong>WSF SARL</strong> – 1, rue Émile Desvaux – 14500 Vire.</p>
                    <p className="muted">Le site est déployé sur le serveur <strong>eva.analytiques.fr</strong>.</p>

                    <h2>Propriété intellectuelle et contenu</h2>
                    <p>
                        Le contenu rédactionnel du site <a href="https://www.long-island-factory.fr">https://www.long-island-factory.fr</a>
                        appartient à <strong>Long Island Factory</strong>, sauf mention contraire. Toute reproduction, représentation,
                        modification ou adaptation, totale ou partielle, est interdite sans autorisation écrite préalable.
                    </p>
                    <p>
                        Le site ne saurait être tenu pour responsable de propos injurieux, racistes, diffamatoires ou
                        pornographiques échangés sur des espaces interactifs. L’éditeur se réserve le droit de supprimer tout
                        contenu contraire à la loi ou aux valeurs de l’entreprise.
                    </p>

                    <h2>Données personnelles & cookies</h2>
                    <p>
                        Les données collectées via les formulaires (contact, inscription) sont utilisées uniquement par
                        <strong>Long Island Factory</strong> pour répondre aux demandes. Elles ne sont pas transmises à des tiers
                        sans consentement préalable.
                    </p>
                    <p>
                        Conformément au RGPD, vous disposez d’un droit d’accès, de rectification et de suppression de vos
                        données. Pour exercer vos droits, contactez-nous par email (voir ci-dessus).
                    </p>
                    <p>
                        En naviguant sur le site, l’utilisateur accepte l’installation de cookies techniques nécessaires au bon
                        fonctionnement du site. Vous pouvez configurer votre navigateur pour les refuser ; certaines
                        fonctionnalités pourraient alors être limitées.
                    </p>

                    <h2>Crédits</h2>
                    <p>Site réalisé en 2025 par <strong>WSF – Agence Web & IA</strong>.</p>

                    <p className="muted">Dernière mise à jour : août 2025.</p>

                    <p style={{ textAlign: "center", marginTop: "22px" }}>
                        <a className="btn" href="/">← Retour à l’accueil</a>
                    </p>
                </div>
            </main>
        </div>
    );
}

export default MentionsLegales;
