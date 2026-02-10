const RED_AUTORIZADA = '190.15.139.231';

export const soloRedAutorizada = (req, res, next) => {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    if (clientIp.includes(RED_AUTORIZADA) || clientIp.includes('::1')) {
        next();
    } else {
        console.log(`Intento de acceso bloqueado desde IP: ${clientIp}`);
        res.status(403).json({ 
            message: "Acceso denegado: Esta ruta solo es accesible desde la red corporativa." 
        });
    }
};

export function isAdmin(req, res, next) {
  const user = req.user;

  if (!user || user.admin !== 1) {
    return res.status(403).json({ message: "Acceso denegado" });
  }

  next();
}