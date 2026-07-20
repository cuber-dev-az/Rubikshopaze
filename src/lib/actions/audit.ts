'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

export interface AuditLogDB {
  id: string;
  user_id?: string;
  user_email?: string;
  user_name?: string;
  action: string;
  table_name: string;
  record_id?: string;
  old_values?: any;
  new_values?: any;
  created_at: string;
}

export async function getAuditLogs() {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Select from audit_logs and try to join profiles
    const { data, error } = await supabase
      .from('audit_logs')
      .select(`
        id,
        user_id,
        action,
        table_name,
        record_id,
        old_values,
        new_values,
        created_at,
        profiles:user_id (
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      // Fallback if there's any join issue
      const { data: simpleData, error: simpleError } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (simpleError) throw simpleError;
      
      const formatted = (simpleData || []).map((log: any) => ({
        id: log.id,
        user_id: log.user_id,
        action: log.action,
        table_name: log.table_name,
        record_id: log.record_id,
        old_values: log.old_values,
        new_values: log.new_values,
        created_at: log.created_at,
        user_name: 'Sistem/İstifadəçi',
        user_email: ''
      }));
      return { success: true, logs: formatted };
    }

    const formatted = (data || []).map((log: any) => {
      const p = Array.isArray(log.profiles) ? log.profiles[0] : log.profiles;
      return {
        id: log.id,
        user_id: log.user_id,
        action: log.action,
        table_name: log.table_name,
        record_id: log.record_id,
        old_values: log.old_values,
        new_values: log.new_values,
        created_at: log.created_at,
        user_name: p?.full_name || 'Admin',
        user_email: p?.email || 'admin@rubikshop.az'
      };
    });

    return { success: true, logs: formatted };
  } catch (error: any) {
    console.error('getAuditLogs error:', error.message);
    return { success: false, error: error.message, logs: [] };
  }
}

export async function createAuditLog(payload: {
  action: string;
  table_name: string;
  record_id?: string;
  old_values?: any;
  new_values?: any;
}) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Get current user id safely
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('audit_logs')
      .insert([{
        user_id: user?.id || null,
        action: payload.action,
        table_name: payload.table_name,
        record_id: payload.record_id || null,
        old_values: payload.old_values || null,
        new_values: payload.new_values || null
      }])
      .select()
      .single();

    if (error) throw error;
    return { success: true, log: data };
  } catch (error: any) {
    console.error('createAuditLog error:', error.message);
    return { success: false, error: error.message };
  }
}
