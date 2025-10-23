import { supabase } from '../../database/connection.js';

export const getAllProducts = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*'); 

        if (error) {
            throw error;
        }

        res.status(200).json(data);

    } catch (err) {
        console.error("Error en getAllProducts:", err.message);
        res.status(500).json({ error: err.message || 'Error al obtener los productos' });
    }
};