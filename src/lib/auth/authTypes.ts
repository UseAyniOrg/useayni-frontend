export interface LoginCredentials {
  personalEmail: string;
  password: string;
  rememberMe?: boolean;
  access_context?: 'platform' | 'organization' | 'member';
}

export interface LoginResponse {
  member: {
    id: string;
    email_personal: string;
    name: string;
    roles: string[];
  };
  accessToken: string;
  refreshToken?: string;
}

export interface SignUpData {
  organization_profile_key?: string;
  profile_data?: Record<string, unknown>;
  accepted_profile_sharing?: boolean;
  name: string;
  cpf?: string;
  phone?: string;
  email_personal: string;
  email_university?: string;
  birth_date?: string;
  admission_date?: string;
  ra?: string;
  password: string;
  confirm_password?: string;
  city_id?: string;
  course_university_id?: string;
  current_semester?: number;
  university_not_applicable?: boolean;
  course_not_applicable?: boolean;
  current_semester_not_applicable?: boolean;
  sponsor?: string;
  custom_fields?: Record<string, string | number | boolean>;
}

export interface RegistrationFieldDefinition {
  field_key: string;
  label: string;
  field_type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'file';
  required: boolean;
  options?: string[] | null;
  position: number;
}

export interface SignUpResponse {
  message: string;
  data: Record<string, unknown>;
}