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