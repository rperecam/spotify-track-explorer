const User = require('../models/User');
const jwt = require('jsonwebtoken');


// Generamos el token del usuario
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Metodo de registro del usuario
exports.register = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    const user = await User.create({ email, password, username });

    res.status(201).json({
      user: { id: user._id, email: user.email, username: user.username },
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Metodo de login del usuario
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role // Agregar role
      },
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Metodo para obtener la informacion del usuario
exports.getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    return res.json({
      id: req.user._id,
      email: req.user.email,
      username: req.user.username,
      role: req.user.role
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};