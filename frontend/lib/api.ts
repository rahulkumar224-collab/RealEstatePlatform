const DEVELOPMENT_API_BASE_URL = "http://127.0.0.1:8000/api";

const normalizeApiBaseUrl = (rawValue: string | undefined) => {
  const configuredValue = rawValue?.trim();

  if (!configuredValue) {
    if (process.env.NODE_ENV === "development") {
      return DEVELOPMENT_API_BASE_URL;
    }

    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL is required outside development and must be a full URL ending in /api.",
    );
  }

  const normalizedValue = configuredValue.replace(/\/+$/, "");
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(normalizedValue);
  } catch {
    throw new Error("NEXT_PUBLIC_API_BASE_URL must be an absolute URL.");
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new Error("NEXT_PUBLIC_API_BASE_URL must use http: or https:.");
  }

  const normalizedPathname = parsedUrl.pathname.replace(/\/+$/, "");

  if (/\/api\/api$/i.test(normalizedPathname)) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL must not end in duplicated /api/api.");
  }

  if (!/\/api$/i.test(normalizedPathname)) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL must include the full API path ending in /api.");
  }

  return normalizedValue;
};

const API_BASE_URL = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);
const TOKEN_STORAGE_KEY = "realestateplatform_auth_token";
export const AUTH_CHANGED_EVENT = "auth:changed";

export type InquiryStatus = "new" | "contacted" | "closed";
export type PropertyVisitStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type UserRole = "admin" | "buyer";
export type PropertyType = "buy" | "rent";
export type PropertyCategory = "residential" | "commercial";

export interface PropertyImage {
  id: number;
  image_path: string;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
}

export interface Property {
  id: number;
  title: string;
  description: string;
  price: string | number;
  city: string;
  state: string;
  type: PropertyType;
  category: PropertyCategory;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number;
  image?: string | null;
  primary_image?: string | null;
  images?: PropertyImage[];
  images_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePropertyPayload {
  title: string;
  description: string;
  price: number;
  city: string;
  state: string;
  type: PropertyType;
  category: PropertyCategory;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area: number;
  image?: string | null;
}

export type PropertyFilters = {
  city?: string;
  type?: PropertyType | "";
};

export type SubmitPropertyInquiryPayload = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

export type SubmitPropertyVisitPayload = {
  name: string;
  email: string;
  phone: string;
  visit_date: string;
  visit_time: string;
  notes?: string | null;
};

export type UpdatePropertyPayload = CreatePropertyPayload;

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phone?: string | null;
  avatar?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  pincode?: string | null;
  bio?: string | null;
  is_verified?: boolean;
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

type PropertySummary = {
  id: number;
  title: string;
  city?: string;
  state?: string;
};

export type Inquiry = {
  id: number;
  property_id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: InquiryStatus;
  created_at: string;
  updated_at: string;
  property?: PropertySummary;
};

export type PropertyVisit = {
  id: number;
  property_id: number;
  name: string;
  email: string;
  phone: string;
  visit_date: string;
  visit_time: string;
  notes: string | null;
  status: PropertyVisitStatus;
  created_at: string;
  updated_at: string;
  property?: PropertySummary;
};

type AuthResponse = {
  success: boolean;
  message: string;
  user: User;
  token: string;
};

type InquiriesResponse = {
  success: boolean;
  inquiries: Inquiry[];
};

type PropertyVisitsResponse = {
  success: boolean;
  visits: PropertyVisit[];
};

type InquiryStatusResponse = {
  success: boolean;
  message: string;
  inquiry: Inquiry;
};

type PropertyVisitStatusResponse = {
  success: boolean;
  message: string;
  visit: PropertyVisit;
};

type CreatePropertyResponse = {
  success: boolean;
  message: string;
  property: Property;
};

type UpdatePropertyResponse = {
  success: boolean;
  message: string;
  property: Property;
};

type DeletePropertyResponse = {
  success: boolean;
  message: string;
};

type UploadPropertyImagesResponse = {
  success: boolean;
  message: string;
  property_id: number;
  images: PropertyImage[];
};

type PublicSubmissionResponse = {
  success: boolean;
  message: string;
};

type PropertyImageActionResponse = {
  success: boolean;
  message: string;
};

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

export const getAuthToken = () =>
  typeof window === "undefined" ? null : window.localStorage.getItem(TOKEN_STORAGE_KEY);

export const setAuthToken = (token: string) => {
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
};

export const clearAuthToken = () => {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  }
};

const notifyUnauthorized = () => {
  clearAuthToken();

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("auth:unauthorized"));
  }
};

const notifyForbidden = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("auth:forbidden"));
  }
};

const getErrorMessage = async (response: Response) => {
  try {
    const body = (await response.json()) as { message?: string; errors?: Record<string, string[]> };
    const validationMessage = body.errors
      ? Object.values(body.errors).flat().find(Boolean)
      : undefined;

    return validationMessage ?? body.message ?? "The request could not be completed.";
  } catch {
    return "The request could not be completed.";
  }
};

const parseSuccessResponse = async <T>(response: Response): Promise<T> => {
  let body: string;

  try {
    body = await response.text();
  } catch {
    throw new ApiError("The API response could not be read.", response.status);
  }

  if (!body.trim()) {
    throw new ApiError("The API returned an empty response.", response.status);
  }

  try {
    return JSON.parse(body) as T;
  } catch {
    throw new ApiError("The API returned an invalid JSON response.", response.status);
  }
};

const request = async <T>(
  path: string,
  options: RequestInit = {},
  requiresAuth = true,
): Promise<T> => {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  if (options.body && !isFormData) {
    headers.set("Content-Type", "application/json");
  }

  if (requiresAuth) {
    const token = getAuthToken();

    if (!token) {
      notifyUnauthorized();
      throw new ApiError("Your session has expired. Please log in again.", 401);
    }

    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch {
    throw new ApiError("The API could not be reached. Please try again.", 0);
  }

  if (response.status === 401) {
    notifyUnauthorized();
    throw new ApiError("Your session has expired. Please log in again.", 401);
  }

  if (requiresAuth && response.status === 403) {
    notifyForbidden();
  }

  if (!response.ok) {
    throw new ApiError(await getErrorMessage(response), response.status);
  }

  return parseSuccessResponse<T>(response);
};

export const login = async (email: string, password: string) => {
  const response = await request<AuthResponse>(
    "/login",
    { method: "POST", body: JSON.stringify({ email, password }) },
    false,
  );

  setAuthToken(response.token);
  return response.user;
};

export const register = async (
  name: string,
  email: string,
  password: string,
  passwordConfirmation: string,
) => {
  const response = await request<AuthResponse>(
    "/register",
    {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      }),
    },
    false,
  );

  setAuthToken(response.token);
  return response.user;
};

export const logout = async () => {
  try {
    await request<{ success: boolean }>("/logout", { method: "POST" });
  } finally {
    clearAuthToken();
  }
};

export const getCurrentUser = () => request<User>("/user");

export const getProperties = (filters: PropertyFilters = {}) => {
  const query = new URLSearchParams();
  const city = filters.city?.trim();

  if (city) query.set("city", city);
  if (filters.type) query.set("type", filters.type);

  const queryString = query.toString();
  return request<Property[]>(
    `/properties${queryString ? `?${queryString}` : ""}`,
    {},
    false,
  );
};

export const getProperty = (id: number) =>
  request<Property>(`/properties/${id}`, {}, false);

export const createProperty = async (payload: CreatePropertyPayload) => {
  const response = await request<CreatePropertyResponse>("/properties", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.property;
};

export const updateProperty = async (
  id: number,
  payload: UpdatePropertyPayload,
) => {
  const response = await request<UpdatePropertyResponse>(`/properties/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return response.property;
};

export const deleteProperty = async (id: number) => {
  await request<DeletePropertyResponse>(`/properties/${id}`, {
    method: "DELETE",
  });
};

export const uploadPropertyImages = async (
  propertyId: number,
  images: File[],
) => {
  const formData = new FormData();
  images.forEach((image) => formData.append("images[]", image));

  const response = await request<UploadPropertyImagesResponse>(
    `/properties/${propertyId}/images`,
    { method: "POST", body: formData },
  );
  return response.images;
};

export const deletePropertyImage = async (
  propertyId: number,
  imageId: number,
) => {
  await request<PropertyImageActionResponse>(
    `/properties/${propertyId}/images/${imageId}`,
    { method: "DELETE" },
  );
};

export const makePrimaryPropertyImage = async (
  propertyId: number,
  imageId: number,
) => {
  await request<PropertyImageActionResponse>(
    `/properties/${propertyId}/images/${imageId}/primary`,
    { method: "PUT" },
  );
};

export const submitPropertyInquiry = async (
  propertyId: number,
  payload: SubmitPropertyInquiryPayload,
) => {
  const response = await request<PublicSubmissionResponse>(
    `/properties/${propertyId}/inquiries`,
    { method: "POST", body: JSON.stringify(payload) },
    false,
  );
  return response.message;
};

export const submitPropertyVisit = async (
  propertyId: number,
  payload: SubmitPropertyVisitPayload,
) => {
  const response = await request<PublicSubmissionResponse>(
    `/properties/${propertyId}/visits`,
    { method: "POST", body: JSON.stringify(payload) },
    false,
  );
  return response.message;
};

export const getInquiries = async () => {
  const response = await request<InquiriesResponse>("/inquiries");
  return response.inquiries;
};

export const updateInquiryStatus = async (id: number, status: InquiryStatus) => {
  const response = await request<InquiryStatusResponse>(`/inquiries/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return response.inquiry;
};

export const getPropertyVisits = async () => {
  const response = await request<PropertyVisitsResponse>("/property-visits");
  return response.visits;
};

export const updatePropertyVisitStatus = async (
  id: number,
  status: PropertyVisitStatus,
) => {
  const response = await request<PropertyVisitStatusResponse>(
    `/property-visits/${id}/status`,
    { method: "PATCH", body: JSON.stringify({ status }) },
  );
  return response.visit;
};
