// ====== URL QUERY PARAMS
export type UrlQueryParams = {
  params: string;
  key: string;
  value: string | null;
};

export type RemoveUrlQueryParams = {
  params: string;
  keysToRemove: string[];
};

export type SearchParamProps = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

// create user params
export type CreateUserParams = {
  clerkId: string;
  email: string;
  photo: string;
  firstName: string;
  lastName: string;
};

// update user params
export type UpdateUserParams = Partial<{
  firstName: string;
  lastName: string;
  photo: string;
  email: string;
  username: string;
  phoneNumber: string;
  country: string;
  city: string;
  state: string;
  coverPhoto: string | undefined;
  status: string;
  dob: Date;
  isPhoneVerified: boolean;
  isProfileCompleted: boolean;
  familyId: string;
  gender: 'male' | 'female';
}>;
