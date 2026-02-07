
/**
 * Firebase has been removed in favor of Local-First Storage.
 * This file remains as a placeholder to prevent build errors.
 */
export const db = null as any;
export const getProjectId = () => "local-storage";
export const testFirebaseConnection = async () => ({ success: true, message: "Local Workspace Active" });
export const seedDatabase = async () => ({ success: true, message: "Local Workspace Active" });
