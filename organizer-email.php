<?php
// organizer-email.php - Endpoint pour recevoir les demandes d'organisateur et envoyer l'email

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Methode non autorisée']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Données invalides']);
    exit();
}

// Validation des champs requis
$required = ['nom', 'prenom', 'email', 'telephone', 'activite', 'entreprise', 'raison'];
foreach ($required as $field) {
    if (empty($data[$field])) {
        http_response_code(400);
        echo json_encode(['error' => "Champ manquant: $field"]);
        exit();
    }
}

// Destinataire de l'email
$to = 'brewen@wsf.fr';
$subject = "Demande organisateur - {$data['entreprise']}";

// Corps de l'email
$body = "Nouvelle demande organisateur\n\n";
$body .= "Nom: {$data['nom']}\n";
$body .= "Prenom: {$data['prenom']}\n";
$body .= "Email: {$data['email']}\n";
$body .= "Telephone: {$data['telephone']}\n";
$body .= "Activite: {$data['activite']}\n";
$body .= "Entreprise: {$data['entreprise']}\n";
$body .= "Raison: {$data['raison']}\n";

// Headers
$headers = "From: {$data['email']}\r\n";
$headers .= "Reply-To: {$data['email']}\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

// Envoyer l'email
$success = mail($to, $subject, $body, $headers);

if ($success) {
    http_response_code(200);
    echo json_encode(['message' => 'Demande envoyee avec succes']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Impossible d\'envoyer l\'email']);
}
?>
