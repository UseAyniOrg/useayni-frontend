export interface LoginCredentials {
  personalEmail: string;
  password: string;
  rememberMe?: boolean;
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
  name: string;
  cpf: string;
  phone: string;
  email_personal: string;
  email_university: string;
  birth_date: string;
  admission_date: string;
  ra: string;
  password: string;
  city_id?: string;
  course_university_id?: string;
  current_semester?: number;
  university_not_applicable?: boolean;
  course_not_applicable?: boolean;
  current_semester_not_applicable?: boolean;
  sponsor?: string;
}

export interface SignUpResponse {
  message: string;
  data: Record<string, unknown>;
}