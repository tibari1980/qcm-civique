export const welcomeTemplate = (name: string) => `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenue sur CiviQ Quiz</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f9; color: #333;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f7f9; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                    <!-- Drapeau Tricolore -->
                    <tr>
                        <td height="6" style="padding: 0; line-height: 0;">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td width="33.33%" height="6" style="background-color: #002654;"></td>
                                    <td width="33.33%" height="6" style="background-color: #ffffff;"></td>
                                    <td width="33.33%" height="6" style="background-color: #E1000F;"></td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Header avec Bloc-Marque -->
                    <tr>
                        <td style="padding: 30px 40px; border-bottom: 3px solid #002654; text-align: left;">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td>
                                        <div style="font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #000;">République<br>Française</div>
                                        <div style="font-size: 10px; font-style: italic; margin-top: 4px; color: #555;">Liberté<br>Égalité<br>Fraternité</div>
                                    </td>
                                    <td align="right">
                                        <div style="font-weight: bold; font-size: 24px; color: #002654;">CiviQ Quiz</div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Contenu Principal -->
                    <tr>
                        <td style="padding: 40px;">
                            <h1 style="color: #002654; font-size: 24px; margin-bottom: 20px;">Bienvenue parmi nous !</h1>
                            <p style="font-size: 16px; line-height: 1.6; color: #555;">
                                Bonjour <strong>${name}</strong>,<br><br>
                                Nous sommes ravis de vous accueillir sur <strong>CiviQ Quiz</strong>, la plateforme officielle de préparation à la culture citoyenne et aux examens civiques.
                            </p>
                            <p style="font-size: 16px; line-height: 1.6; color: #555;">
                                Votre compte est désormais actif. Vous pouvez dès à présent accéder à vos entraînements, suivre votre progression et obtenir vos premières certifications.
                            </p>
                            
                            <!-- Bouton Call-to-Action -->
                            <table border="0" cellspacing="0" cellpadding="0" style="margin: 40px auto;">
                                <tr>
                                    <td align="center" bgcolor="#002654" style="border-radius: 4px;">
                                        <a href="https://civiqquiz.com/login" target="_blank" style="padding: 14px 28px; font-size: 16px; color: #ffffff; text-decoration: none; font-weight: bold; display: inline-block;">
                                            Accéder à mon Dashboard
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="font-size: 14px; color: #888; text-align: center; margin-top: 30px;">
                                Si vous n'avez pas créé de compte, vous pouvez ignorer cet e-mail.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="font-size: 12px; color: #64748b; margin: 0;">
                                &copy; 2026 CiviQ Quiz • Service de Culture Citoyenne
                            </p>
                            <p style="font-size: 10px; color: #94a3b8; margin-top: 10px; text-transform: uppercase; letter-spacing: 1px;">
                                République Française
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;
