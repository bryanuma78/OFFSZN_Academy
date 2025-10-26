import { supabase } from '../../database/connection.js';

export const getMyPurchasedProducts = async (req, res) => {
    try {
        const userId = req.user.userId;

        const { data: items, error: itemsError } = await supabase
            .from('order_items')
            .select(`
                *, 
                orders!inner (user_id, status), 
                products (id, name, description, image_url, download_url)
            `)
            .eq('orders.user_id', userId)
            .eq('orders.status', 'completed');

        if (itemsError) {
            throw itemsError;
        }

        const purchasedProductsMap = new Map();
        items.forEach(item => {
            if (item.products && !purchasedProductsMap.has(item.products.id)) {
                purchasedProductsMap.set(item.products.id, item.products);
            }
        });
        const uniquePurchasedProducts = Array.from(purchasedProductsMap.values());

        res.status(200).json(uniquePurchasedProducts);

    } catch (err) {
        console.error("Error en getMyPurchasedProducts:", err.message);
        res.status(500).json({ error: err.message || 'Error al obtener los productos comprados' });
    }
};

export const completeOnboarding = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { nickname, role, firstName, lastName, socials } = req.body;

        if (!nickname) {
            return res.status(400).json({ error: 'El nickname es obligatorio.' });
        }

        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('id')
            .eq('nickname', nickname)
            .neq('id', userId)
            .maybeSingle();

        if (checkError) throw checkError;
        if (existingUser) {
            return res.status(409).json({ error: 'Ese nickname ya está en uso. Elige otro.' });
        }

        const updateData = { nickname: nickname };
        if (role) updateData.role = role;
        if (firstName) updateData.first_name = firstName;
        if (lastName) updateData.last_name = lastName;
        if (socials && typeof socials === 'object' && Object.keys(socials).length > 0) {
             updateData.socials = socials; 
        }

        const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', userId)
            .select('id, email, nickname, role, first_name, last_name, created_at, is_admin, socials');

        if (updateError) throw updateError;
        if (!updatedUser || updatedUser.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado para actualizar.' });
        }


        res.status(200).json({ message: 'Perfil completado exitosamente.', user: updatedUser[0] });

    } catch (err) {
        console.error("Error en completeOnboarding:", err.message);
        res.status(500).json({ error: err.message || 'Error al completar el perfil.' });
    }
};

export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user.userId;

        const { data: user, error } = await supabase
            .from('users')
            .select('id, email, nickname, role, first_name, last_name, created_at, is_admin')
            .eq('id', userId)
            .single();

        if (error) throw error;
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });

        res.status(200).json(user);

    } catch (err) {
        console.error("Error en getCurrentUser:", err.message);
        res.status(500).json({ error: err.message || 'Error al obtener datos del usuario.' });
    }
};