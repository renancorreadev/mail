// server.js
import express from 'express';
import nodemailer from 'nodemailer';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configuração dos middlewares
app.use(cors({
  origin: ['http://localhost:3000', 'http://167.88.39.138', 'https://caramelocoin.com', 'http://caramelocoin.com'],
  methods: ['POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiting para prevenir spam
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 3600000; // 1 hora em milissegundos
const MAX_REQUESTS = 5; // máximo de 5 emails por IP por hora

function isRateLimited(ip) {
  const now = Date.now();
  const userRequests = rateLimit.get(ip) || [];
  
  // Remove requisições antigas
  const recentRequests = userRequests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
  
  if (recentRequests.length >= MAX_REQUESTS) {
    return true;
  }
  
  recentRequests.push(now);
  rateLimit.set(ip, recentRequests);
  return false;
}

// Template para o usuário
const userEmailTemplate = (userEmail) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
</head>
<body style="margin: 0; padding: 20px; background-color: #FEE8C0; font-family: Arial, sans-serif;">
    <table cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; margin: 0 auto; background-color: #fff; border-radius: 15px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        <!-- Header -->
        <tr>
            <td style="background-color: #F4A339; padding: 40px 20px; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 15px;">🐕</div>
                <h1 style="margin: 0; color: #fff; font-size: 32px; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);">Bem-vindo à Caramelo Coin!</h1>
            </td>
        </tr>

        <!-- Content -->
        <tr>
            <td style="padding: 40px 30px;">
                <h2 style="color: #F4A339; margin-top: 0; font-size: 24px; border-bottom: 2px solid #FFD200; padding-bottom: 10px;">Obrigado por se juntar à nossa comunidade! 🚀</h2>
                
                <p style="color: #000; line-height: 1.6;">Olá!</p>
                <p style="color: #000; line-height: 1.6;">Estamos muito felizes em ter você conosco! Seu email <span style="color: #F4A339; font-weight: bold;">${userEmail}</span> foi cadastrado com sucesso.</p>
                
                <div style="background-color: #FEE8C0; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <p style="color: #000; margin-top: 0;"><strong>O que você pode esperar agora:</strong></p>
                    <ul style="margin: 0; padding-left: 0;">
                        <li style="color: #000; list-style-type: none; margin: 10px 0; padding-left: 25px;">🌟 Notificações sobre o lançamento do token</li>
                        <li style="color: #000; list-style-type: none; margin: 10px 0; padding-left: 25px;">🌟 Atualizações exclusivas do projeto</li>
                        <li style="color: #000; list-style-type: none; margin: 10px 0; padding-left: 25px;">🌟 Oportunidades especiais para early adopters</li>
                        <li style="color: #000; list-style-type: none; margin: 10px 0; padding-left: 25px;">🌟 Conteúdo educacional sobre criptomoedas</li>
                    </ul>
                </div>

                <p style="color: #000; line-height: 1.6;">Fique atento à sua caixa de entrada para não perder nenhuma novidade!</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://caramelocoin.com" style="background-color: #FFD200; color: #000; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">Visite Nosso Site</a>
                </div>
            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td style="background-color: #F4A339; padding: 20px; text-align: center;">
                <div style="margin: 15px 0;">
                    <a href="https://x.com/caramelocoinofc" style="color: #fff; text-decoration: none; margin: 0 10px; font-weight: bold;">Twitter</a> |
                    <a href="https://t.me/caramelocoincripto" style="color: #fff; text-decoration: none; margin: 0 10px; font-weight: bold;">Telegram</a>
                </div>
                <p style="margin: 5px 0; color: #fff; font-size: 14px;">© 2024 Caramelo Coin. Todos os direitos reservados.</p>
            </td>
        </tr>
    </table>
</body>
</html>
`;

// Template para o admin
const adminEmailTemplate = (userEmail) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
</head>
<body style="margin: 0; padding: 20px; background-color: #FEE8C0; font-family: Arial, sans-serif;">
    <table cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; margin: 0 auto; background-color: #fff; border-radius: 15px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        <tr>
            <td style="background-color: #F4A339; padding: 20px; text-align: center;">
                <h1 style="margin: 0; color: #fff; font-size: 24px;">Novo Cadastro na Caramelo Coin! 🎉</h1>
            </td>
        </tr>
        <tr>
            <td style="padding: 30px;">
                <p style="color: #000; line-height: 1.6;">Um novo usuário se cadastrou para receber atualizações!</p>
                <p style="color: #000; line-height: 1.6;">Email cadastrado: <strong>${userEmail}</strong></p>
                <p style="color: #000; line-height: 1.6;">Data do cadastro: ${new Date().toLocaleString('pt-BR')}</p>
            </td>
        </tr>
    </table>
</body>
</html>
`;

app.post('/subscribe', async (req, res) => {
  try {
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    // Verifica rate limit
    if (isRateLimited(clientIP)) {
      return res.status(429).json({ 
        success: false, 
        message: 'Muitas tentativas. Por favor, aguarde um momento antes de tentar novamente.' 
      });
    }

    const { email } = req.body;

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email inválido' 
      });
    }
    
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'skynancemusic@gmail.com',
        pass: 'fnuf osnn qqrf vaow'
      }
    });

    // Email para o usuário
    await transporter.sendMail({
      from: '"Caramelo Coin" <skynancemusic@gmail.com>',
      to: email,
      subject: '🐕 Bem-vindo à Comunidade Caramelo Coin!',
      html: userEmailTemplate(email)
    });

    // Email para o admin
    await transporter.sendMail({
      from: '"Caramelo Coin" <skynancemusic@gmail.com>',
      to: 'skynancemusic@gmail.com',
      subject: '🎉 Novo cadastro na Caramelo Coin!',
      html: adminEmailTemplate(email)
    });

    res.json({ success: true, message: 'Email enviado com sucesso!' });
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    res.status(500).json({ success: false, message: 'Erro ao enviar email', error: error.message });
  }
});

// Inicia o servidor
const PORT = process.env.PORT || 2500;
const HOST = '0.0.0.0'; // Permite conexões de qualquer IP

app.listen(PORT, HOST, () => {
  console.log(`Servidor rodando em http://${HOST}:${PORT}`);
});