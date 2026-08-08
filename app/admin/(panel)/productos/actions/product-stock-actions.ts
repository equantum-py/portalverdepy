'use server';

import { revalidatePath } from 'next/cache';

import { createClient } from '@/lib/supabase/server';

type StockActionResult = {
  success: boolean;
  message: string;
};

export async function updateProductStockAction(
  productId: string,
  inStock: boolean,
): Promise<StockActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: 'Tu sesión venció. Volvé a iniciar sesión.',
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role,is_active')
    .eq('id', user.id)
    .single();

  if (
    profileError ||
    !profile?.is_active ||
    !['admin', 'editor'].includes(profile.role)
  ) {
    return {
      success: false,
      message: 'No tenés permisos para cambiar la disponibilidad.',
    };
  }

  const { error } = await supabase
    .from('products')
    .update({
      in_stock: inStock,
      updated_at: new Date().toISOString(),
    })
    .eq('id', productId);

  if (error) {
    return {
      success: false,
      message: `No se pudo actualizar el stock: ${error.message}`,
    };
  }

  await supabase.from('activity_logs').insert({
    user_id: user.id,
    action: 'product.stock_updated',
    entity_type: 'product',
    entity_id: productId,
    metadata: {
      in_stock: inStock,
    },
  });

  revalidatePath('/admin/productos');
  revalidatePath('/shop');
  revalidatePath('/');

  return {
    success: true,
    message: inStock
      ? 'Producto marcado como disponible.'
      : 'Producto marcado como agotado.',
  };
}
