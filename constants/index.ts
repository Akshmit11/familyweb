import { z } from "zod";
import { IUser } from '@/lib/database/models/user.model';
import { IRelationship } from '@/lib/database/models/relationship.model';
import { IFamily } from '@/lib/database/models/family.model';

export const countryCodeEnum = z.enum([
  "+1 (US)", // United States
    "+1 (CA)",   // Canada
    "+44 (GB)",  // United Kingdom
    "+91 (IN)",  // India
    "+86 (CN)",  // China
    "+81 (JP)",  // Japan
    "+49 (DE)",  // Germany
    "+33 (FR)",  // France
    "+39 (IT)",  // Italy
    "+7 (RU)",   // Russia
    "+34 (ES)",  // Spain
    "+61 (AU)",  // Australia
    "+55 (BR)",  // Brazil
    "+27 (ZA)",  // South Africa
    "+82 (KR)",  // South Korea
    "+46 (SE)",  // Sweden
    "+31 (NL)",  // Netherlands
    "+41 (CH)",  // Switzerland
    "+63 (PH)",  // Philippines
    "+62 (ID)",  // Indonesia
    "+234 (NG)", // Nigeria
    "+20 (EG)",  // Egypt
    "+52 (MX)",  // Mexico
    "+66 (TH)",  // Thailand
    "+90 (TR)",  // Turkey
    "+60 (MY)",  // Malaysia
    "+94 (LK)",  // Sri Lanka
    "+64 (NZ)",  // New Zealand
    "+48 (PL)",  // Poland
    "+30 (GR)",  // Greece
    "+353 (IE)", // Ireland
    "+386 (SI)", // Slovenia
    "+420 (CZ)", // Czech Republic
    "+36 (HU)",  // Hungary
    "+372 (EE)", // Estonia
    "+48 (PL)",  // Poland
    "+351 (PT)", // Portugal
    "+45 (DK)",  // Denmark
    "+64 (NZ)",  // New Zealand
    "+370 (LT)", // Lithuania
    "+371 (LV)", // Latvia
    "+380 (UA)", // Ukraine
    "+359 (BG)", // Bulgaria
    "+598 (UY)", // Uruguay
    "+56 (CL)",  // Chile
    "+51 (PE)",  // Peru
    "+593 (EC)", // Ecuador
    "+502 (GT)", // Guatemala
    "+505 (NI)", // Nicaragua
    "+507 (PA)", // Panama
    "+54 (AR)",  // Argentina
    "+257 (BI)", // Burundi
    "+243 (CD)", // Congo (Kinshasa)
    "+240 (GQ)", // Equatorial Guinea
    "+254 (KE)", // Kenya
    "+231 (LR)", // Liberia
    "+222 (MR)", // Mauritania
    "+212 (MA)", // Morocco
    "+227 (NE)", // Niger
    "+234 (NG)", // Nigeria
    "+250 (RW)", // Rwanda
    "+248 (SC)", // Seychelles
    "+249 (SD)", // Sudan
    "+255 (TZ)", // Tanzania
    "+256 (UG)", // Uganda
    "+260 (ZM)", // Zambia
    "+263 (ZW)", // Zimbabwe
    "+676 (TO)", // Tonga
    "+678 (VU)", // Vanuatu
    "+372 (EE)", // Estonia
    "+850 (KR)", // N.Korea
   
  ]);
export type countryCodeEnum = z.infer<typeof countryCodeEnum>;




