import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';

import { AdminHeader } from '@/components/admin/admin-header';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { createClient } from '@/lib/supabase/server';

export default async function AdminPanelLayout({
  children
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, is_active')
    .eq('id', user.id)
    .single();

  if (
    !profile ||
    !profile.is_active ||
    !['admin', 'editor'].includes(profile.role)
  ) {
    await supabase.auth.signOut();
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-[#f4f7f4] lg:pl-72">
      <AdminSidebar />

      <div className="min-w-0">
        <AdminHeader
          fullName={profile.full_name || user.email || 'Administrador'}
          role={profile.role}
        />

        <main className="min-w-0 p-3 sm:p-6 lg:p-8 max-sm:[&_input:not([type=checkbox]):not([type=radio]):not([type=file])]:text-base max-sm:[&_textarea]:text-base max-sm:[&_select]:text-base">
          {children}
        </main>
      </div>
    </div>
  );
}
