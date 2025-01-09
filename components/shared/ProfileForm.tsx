"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { countryCodeEnum } from "@/constants";
import { updateUser } from "@/lib/actions/user.actions";
import { IUser } from "@/lib/database/models/user.model";
import { useUploadThing } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";
import { profileFormSchema } from "@/lib/validator";
import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

type ProfileFormProps = {
  userId: string;
  user: IUser;
  type: "Create" | "Update";
};

export function ProfileForm({ userId, type, user }: ProfileFormProps) {
  const { user: clerkUser } = useUser();
  const [photo, setPhoto] = useState<File | string | null>(user?.photo || null);
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [photoInputRef, setPhotoInputRef] = useState<HTMLInputElement | null>(
    null
  );
  const [coverPhotoInputRef, setCoverPhotoInputRef] =
    useState<HTMLInputElement | null>(null);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const router = useRouter();

  const initialValues =
    type === "Update"
      ? {
          ...user,
          dob: user.dob ? new Date(user.dob) : undefined,
        }
      : {};

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: initialValues,
  });

  async function handleProfilePhotoUpdate(file: File) {
    if (!clerkUser) return;
    try {
      await clerkUser.setProfileImage({ file });
    } catch (error: any) {
      console.error("Error updating profile photo:", error);
    }
  }

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      setPhoto(file);
      handleProfilePhotoUpdate(file); // Update photo using Clerk API
    }
  }

  const { startUpload } = useUploadThing("uploader");

  async function onSubmit(values: z.infer<typeof profileFormSchema>) {
    if (!values.isPhoneVerified) {
      form.setError("phoneNumber", {
        type: "manual",
        message: "Please verify your phone number first",
      });
      return;
    }

    let coverPhotoUrl = values.coverPhoto;

    // Upload cover photo if it exists
    if (coverPhoto) {
      const uploadResponse = await startUpload([coverPhoto]);
      if (uploadResponse && uploadResponse[0].url) {
        coverPhotoUrl = uploadResponse[0].url;
      }
    }

    // Update the values with the new cover photo URL
    const updatedValues = {
      ...values,
      photo: clerkUser?.imageUrl || user.photo,
      isProfileCompleted: true,
      coverPhoto: coverPhotoUrl,
    };

    // console.log(updatedValues);
    if (!userId) {
      router.back();
      return;
    }
    try {
      const updatedUser = await updateUser(
        userId,
        updatedValues,
        `/profile/${user._id}`
      );
      if (updatedUser) {
        form.reset();
        router.push(`/profile/${user._id}`);
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto p-4 sm:p-6">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl font-bold text-center sherika tracking-wide">
          Complete Your Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 sm:space-y-8 geistSans"
          >
            <div className="space-y-4 geistSans">
              <FormField
                control={form.control}
                name="photo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="geistSans">Profile Photo</FormLabel>
                    <FormControl>
                      <div
                        className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-full cursor-pointer hover:border-gray-400 transition-colors geistSans"
                        onClick={() => photoInputRef?.click()}
                      >
                        {photo ? (
                          <img
                            src={
                              photo instanceof File
                                ? URL.createObjectURL(photo)
                                : photo
                            }
                            alt="Profile"
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <Upload className="w-8 h-8 text-gray-400" />
                        )}
                        <Input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          ref={setPhotoInputRef}
                          // onChange={(e) => {
                          //   const file = e.target.files?.[0];
                          //   if (file) {
                          //     setPhoto(file);
                          //     field.onChange(file.name);
                          //   }
                          // }}
                          onChange={handlePhotoChange}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Click to upload your profile photo
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-[100px_1fr_auto] sm:grid-cols-[100px_1fr_auto] gap-4">
                <FormField
                  control={form.control}
                  name="countryCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country Code</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(countryCodeEnum.Values).map((code) => (
                            <SelectItem
                              key={code}
                              value={code}
                              className="geistSans"
                            >
                              {code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem className="col-span-1">
                      <FormLabel>Phone Number</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input
                            placeholder="1234567890"
                            {...field}
                            disabled={form.watch("isPhoneVerified")}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant={
                            form.watch("isPhoneVerified")
                              ? "outline"
                              : "default"
                          }
                          onClick={() => setVerifyDialogOpen(true)}
                          disabled={form.watch("isPhoneVerified")}
                          className={cn(
                            form.watch("isPhoneVerified") &&
                              "bg-green-50 text-green-600 hover:bg-green-50 hover:text-green-600"
                          )}
                        >
                          {form.watch("isPhoneVerified") ? (
                            <span className="flex items-center gap-2">
                              Verified ✓
                            </span>
                          ) : (
                            "Verify"
                          )}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="showPhoneNumber"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Show Phone Number
                      </FormLabel>
                      <FormDescription>
                        Display your phone number on your public profile
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="United States" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="California" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="San Francisco" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="coverPhoto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Photo</FormLabel>
                    <FormControl>
                      <div
                        className="flex items-center justify-center w-full h-32 sm:h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                        onClick={() => coverPhotoInputRef?.click()}
                      >
                        {coverPhoto ? (
                          <img
                            src={URL.createObjectURL(coverPhoto)}
                            alt="Cover"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : user?.coverPhoto ? (
                          <img
                            src={user.coverPhoto}
                            alt="Cover"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Upload className="w-8 h-8 text-gray-400" />
                        )}
                        <Input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          ref={setCoverPhotoInputRef}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setCoverPhoto(file);
                              field.onChange(file.name); // Store filename temporarily
                            }
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Click to upload your cover photo
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="geistSans">Status</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="What's on your mind?"
                        className="geistSans"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Share a brief status or bio (max 200 characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="geistSans">Date of birth</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal geistSans",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[280px] sm:w-auto p-0"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          className="geistSans"
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                          month={field.value || undefined}
                          footer={
                            <div className="flex flex-col sm:flex-row justify-center gap-2 mt-4 geistSans">
                              <Select
                                onValueChange={(year) => {
                                  const newDate = new Date(
                                    field.value || new Date()
                                  );
                                  newDate.setFullYear(parseInt(year));
                                  field.onChange(newDate);
                                }}
                                value={
                                  field.value instanceof Date &&
                                  !isNaN(field.value.getTime())
                                    ? field.value.getFullYear().toString()
                                    : undefined
                                }
                              >
                                <SelectTrigger className="w-[100px] geistSans">
                                  <SelectValue placeholder="Year" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from(
                                    { length: 124 },
                                    (_, i) => new Date().getFullYear() - i
                                  ).map((year) => (
                                    <SelectItem
                                      key={year}
                                      className="geistSans"
                                      value={year.toString()}
                                    >
                                      {year}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Select
                                onValueChange={(month) => {
                                  const newDate = new Date(
                                    field.value || new Date()
                                  );
                                  newDate.setMonth(parseInt(month));
                                  field.onChange(newDate);
                                }}
                                value={
                                  field.value instanceof Date &&
                                  !isNaN(field.value.getTime())
                                    ? field.value.getMonth().toString()
                                    : undefined
                                }
                              >
                                <SelectTrigger className="w-[100px] geistSans">
                                  <SelectValue placeholder="Month" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 12 }, (_, i) => i).map(
                                    (month) => (
                                      <SelectItem
                                        key={month}
                                        value={month.toString()}
                                        className="geistSans"
                                      >
                                        {new Date(0, month).toLocaleString(
                                          "default",
                                          { month: "long" }
                                        )}
                                      </SelectItem>
                                    )
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                          }
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Your date of birth is used to calculate your age.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="geistSans">Gender</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-row space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="male" />
                          </FormControl>
                          <FormLabel className="font-normal geistSans">
                            Male
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="female" />
                          </FormControl>
                          <FormLabel className="font-normal geistSans">
                            Female
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="w-full geistSans">
              Complete Profile
            </Button>
          </form>
        </Form>
      </CardContent>

      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="geistSans">
              Verify Phone Number
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground geistSans">
              Enter the 6-digit code sent to your phone number
            </p>
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                <InputOTPSlot index={0} className="geistSans" />
                <InputOTPSlot index={1} className="geistSans" />
                <InputOTPSlot index={2} className="geistSans" />
                <InputOTPSlot index={3} className="geistSans" />
                <InputOTPSlot index={4} className="geistSans" />
                <InputOTPSlot index={5} className="geistSans" />
              </InputOTPGroup>
            </InputOTP>
            <p className="text-sm text-muted-foreground geistSans">
              Didn't receive code?{" "}
              <Button
                variant="link"
                className="p-0 h-auto geistSans"
                onClick={() => {
                  // Add resend OTP logic here
                  console.log("Resend OTP");
                }}
              >
                Resend
              </Button>
            </p>
          </div>
          <DialogFooter className="sm:justify-start geistSans">
            <Button
              type="button"
              className="geistSans"
              onClick={() => {
                // Add your OTP verification logic here
                if (otp.length === 6) {
                  // Verify OTP
                  // This is where you'd typically make an API call to verify the OTP
                  // For demo purposes, we're just checking if it's 6 digits
                  form.setValue("isPhoneVerified", true);
                  setVerifyDialogOpen(false);
                  setOtp("");
                }
              }}
              disabled={otp.length !== 6}
            >
              Verify OTP
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
