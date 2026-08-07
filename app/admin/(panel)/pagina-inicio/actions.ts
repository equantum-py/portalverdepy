'use server';
import { revalidatePath } from 'next/cache';
import { homeContentSchema, type HomeContentValues } from '@/lib/home-content/schema';
import { createClient } from '@/lib/supabase/server';

export async function saveHomeContentAction(input: HomeContentValues) {
  const parsed=homeContentSchema.safeParse(input); if(!parsed.success) return {success:false,message:'Revisá los campos marcados.'};
  const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user) return {success:false,message:'Tu sesión venció.'};
  const {data:profile}=await supabase.from('profiles').select('role,is_active').eq('id',user.id).single(); if(profile?.role!=='admin'||!profile.is_active) return {success:false,message:'No tenés permisos.'};
  const v=parsed.data;
  const {error}=await supabase.from('home_page_settings').upsert({id:true,promo_enabled:v.promoEnabled,promo_text:v.promoText,promo_icon:v.promoIcon,promo_url:v.promoUrl,promo_button_text:v.promoButtonText,promo_scroll:v.promoScroll,promo_speed:v.promoSpeed,promo_new_tab:v.promoNewTab,logo_enabled:v.logoEnabled,logo_desktop_url:v.logoDesktopUrl,logo_mobile_url:v.logoMobileUrl,logo_alt:v.logoAlt,whatsapp_enabled:v.whatsappEnabled,services_enabled:v.servicesEnabled,services_title:v.servicesTitle,services_description:v.servicesDescription,mega_menu_enabled:v.megaMenuEnabled,mega_services_title:v.megaServicesTitle,mega_services_description:v.megaServicesDescription,updated_at:new Date().toISOString()});
  if(error) return {success:false,message:error.message};
  for(const table of ['home_navigation_items','home_service_tags','home_mega_columns','home_mega_services','home_global_buttons'] as const){const {error:deleteError}=await supabase.from(table).delete().not('id','is',null);if(deleteError)return {success:false,message:deleteError.message};}
  const operations=[
    v.navigation.length&&supabase.from('home_navigation_items').insert(v.navigation.map(i=>({name:i.name,url:i.url,sort_order:i.sortOrder,is_active:i.isActive}))),
    v.tags.length&&supabase.from('home_service_tags').insert(v.tags.map(i=>({label:i.label,sort_order:i.sortOrder,is_active:i.isActive}))),
    v.megaServices.length&&supabase.from('home_mega_services').insert(v.megaServices.map(i=>({title:i.title,description:i.description,icon:i.icon,url:i.url,sort_order:i.sortOrder,is_active:i.isActive}))),
    v.buttons.length&&supabase.from('home_global_buttons').insert(v.buttons.map(i=>({placement:i.placement,text:i.text,url:i.url,link_type:i.linkType,icon:i.icon,variant:i.variant,sort_order:i.sortOrder,is_active:i.isActive,new_tab:i.newTab})))];
  for(const operation of operations){if(operation){const {error:relationError}=await operation;if(relationError)return {success:false,message:relationError.message};}}
  for(const column of v.megaColumns){const {data,error:columnError}=await supabase.from('home_mega_columns').insert({title:column.title,icon:column.icon,category_id:column.categoryId||null,view_all_label:column.viewAllLabel,view_all_url:column.viewAllUrl,sort_order:column.sortOrder,is_active:column.isActive}).select('id').single();if(columnError)return {success:false,message:columnError.message};if(column.productIds.length){const {error:productsError}=await supabase.from('home_mega_products').insert(column.productIds.map((productId,sortOrder)=>({column_id:data.id,product_id:productId,sort_order:sortOrder})));if(productsError)return {success:false,message:productsError.message};}}
  for(const section of v.sections){const {error:sectionError}=await supabase.from('home_sections_config').upsert({section_key:section.key,title:section.title,sort_order:section.sortOrder,is_active:section.isActive});if(sectionError)return {success:false,message:sectionError.message};}
  revalidatePath('/');revalidatePath('/admin/pagina-inicio');return {success:true,message:'Contenido actualizado correctamente.'};
}
