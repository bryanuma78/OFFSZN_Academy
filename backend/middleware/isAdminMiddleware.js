const jwt = require('jsonwebtoken');

function isAdmin(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ error: 'Acceso denegado: No hay token' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, userPayload) => {
        if (err) {
            return res.status(403).json({ error: 'Acceso denegado: Token inválido' });
        }

        if (!userPayload || !userPayload.isAdmin) {
            return res.status(403).json({ error: 'Acceso denegado: No eres administrador' });
        }

        req.user = userPayload;
        next();
    });
}

module.exports = isAdmin;