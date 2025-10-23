import { supabase } from '../../database/connection.js';
import { hashPassword, comparePassword } from '../../services/hashing/bcryptService.js';
import { generateToken } from '../../auth/jwt/jwtUtil.js';

export const registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ error: 'Nombre, apellido, email y contraseña son requeridos' });
        }

        const hashedPassword = await hashPassword(password);

        const { data, error } = await supabase
            .from('users')
            .insert([{ 
                first_name: firstName, 
                last_name: lastName, 
                email: email, 
                password: hashedPassword 
            }])
            .select('id, email, created_at, first_name, last_name, is_admin');

        if (error) {
            if (error.code === '23505') {
                return res.status(409).json({ error: 'Este email ya está registrado' });
            }
            throw error;
        }

        res.status(201).json({ message: 'Usuario registrado exitosamente.', user: data[0] });

    } catch (err) {
        console.error("Error en registerUser:", err.message);
        res.status(500).json({ error: err.message || 'Error al registrar el usuario' });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }

        const { data: user, error } = await supabase
            .from('users')
            .select('*, is_admin')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        const isPasswordValid = await comparePassword(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        const tokenPayload = { 
            userId: user.id, 
            email: user.email,
            isAdmin: user.is_admin || false 
        };

        const token = generateToken(tokenPayload);

        const userResponse = { 
            id: user.id, 
            email: user.email, 
            first_name: user.first_name, 
            last_name: user.last_name,
            created_at: user.created_at,
            isAdmin: user.is_admin || false
        };

        res.status(200).json({ 
            message: 'Inicio de sesión exitoso',
            token: token,
            user: userResponse
        });

    } catch (err) {
        console.error("Error en loginUser:", err.message);
        res.status(500).json({ error: err.message ||'Error en el servidor durante el login.' });
    }
};