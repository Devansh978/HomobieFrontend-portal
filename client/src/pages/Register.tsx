import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
// MODIFICATION: Added FileBadge icon for RERA ID
import { Mail, User, Phone, Building, ArrowRight, Check, MapPin, FileBadge } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassBackground } from "@/components/layout/GlassBackground";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import HomobieLogo from "/attached_assets/wmremove-transformed_-_Edited-removebg-preview.png";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://homobiebackend-railway-production.up.railway.app';

// MODIFICATION: Added reraId to the FormData type
type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  roleType: "USER" | "BUILDER" | "BROKER" | "CA" | "ADMIN";
  companyName: string;
  reraId: string; // Added this field
  country: string;
  state: string;
  city: string;
  pincode: string;
  addressLine1: string;
};

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  // MODIFICATION: Initialized reraId in the component's state
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    roleType: "USER",
    companyName: "",
    reraId: "", // Added this field
    country: "",
    state: "",
    city: "",
    pincode: "",
    addressLine1: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (value: FormData['roleType']) => {
    setFormData(prev => ({
      ...prev,
      roleType: value,
      // Reset builder-specific fields if role changes from builder
      companyName: value === 'BUILDER' ? prev.companyName : '',
      reraId: value === 'BUILDER' ? prev.reraId : '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep < 2) {
      nextStep();
      return;
    }

    setIsLoading(true);

    try {
      // MODIFICATION: Added reraId to the submission payload for Builders
      const registrationData = {
        user: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber
        },
        roleData: {
          roleType: formData.roleType,
          ...(formData.roleType === "BUILDER" ? {
            companyName: formData.companyName,
            reraId: formData.reraId, // Added this field
            location: {
              country: formData.country,
              state: formData.state,
              city: formData.city,
              pincode: formData.pincode,
              addressLine1: formData.addressLine1
            }
          } : {
            location: {
              country: formData.country,
              state: formData.state,
              city: formData.city,
              pincode: formData.pincode,
              addressLine1: formData.addressLine1
            }
          })
        }
      };
      console.log(
        registrationData
      )
      const response = await fetch(`${API_BASE_URL}/register/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData)
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      toast({
        title: "Account created successfully!",
        description: "Your account has been created.",
      });

      setLocation("/login");
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <GlassBackground />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 bg-gradient-to-br from-blue-400/30 to-purple-600/30 rounded-full blur-sm"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg px-6"
      >
        <GlassCard gradient="primary" blur="lg" className="p-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-center mb-8"
          >
            <img
              src={HomobieLogo}
              alt="Company Logo"
              className="mx-auto h-24 w-auto mb-4 bg-gradient-to-br from-black-300 to-white-300 "
            />
            <h1 className="text-3xl font-bold text-gradient-primary mb-2">
              Create Account
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Join our loan management platform
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              {[1, 2].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${currentStep >= step
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 border-blue-500 text-white'
                    : 'border-gray-300 text-gray-400 dark:border-gray-600 dark:text-gray-500'
                    }`}>
                    {currentStep > step ? <Check className="w-4 h-4" /> : step}
                  </div>
                  {step < 2 && (
                    <div className={`w-16 h-0.5 mx-2 transition-all ${currentStep > step ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
              <span>Personal</span>
              <span>Address</span>
            </div>
          </motion.div>

          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="John"
                        className="pl-10 bg-white/20 border-white/30 backdrop-blur-sm focus:bg-white/30 focus:border-blue-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Last Name
                    </label>
                    <Input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Doe"
                      className="bg-white/20 border-white/30 backdrop-blur-sm focus:bg-white/30 focus:border-blue-400"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john.doe@example.com"
                      className="pl-10 bg-white/20 border-white/30 backdrop-blur-sm focus:bg-white/30 focus:border-blue-400"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="1234567890"
                      className="pl-10 bg-white/20 border-white/30 backdrop-blur-sm focus:bg-white/30 focus:border-blue-400"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Role
                  </label>
                  <Select
                    value={formData.roleType}
                    onValueChange={handleRoleChange}
                  >
                    <SelectTrigger className="bg-white/20 border-white/30 backdrop-blur-sm focus:bg-white/30 focus:border-blue-400">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">Client</SelectItem>
                      <SelectItem value="BUILDER">Builder</SelectItem>
                      <SelectItem value="BROKER">Broker</SelectItem>
                      <SelectItem value="CA">Chartered Accountant</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* MODIFICATION: Conditionally render Company Name and RERA ID fields */}
                {formData.roleType === 'BUILDER' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Company Name
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                          type="text"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleChange}
                          placeholder="Your Company Name"
                          className="pl-10 bg-white/20 border-white/30 backdrop-blur-sm focus:bg-white/30 focus:border-blue-400"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        RERA ID
                      </label>
                      <div className="relative">
                        <FileBadge className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                          type="text"
                          name="reraId"
                          value={formData.reraId}
                          onChange={handleChange}
                          placeholder="Enter your RERA ID"
                          className="pl-10 bg-white/20 border-white/30 backdrop-blur-sm focus:bg-white/30 focus:border-blue-400"
                          required
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                {/* MODIFICATION: Removed the old Company Name field from this step */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Country
                    </label>
                    <Input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      placeholder="Country"
                      className="bg-white/20 border-white/30 backdrop-blur-sm focus:bg-white/30 focus:border-blue-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      State
                    </label>
                    <Input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="State"
                      className="bg-white/20 border-white/30 backdrop-blur-sm focus:bg-white/30 focus:border-blue-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      City
                    </label>
                    <Input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="City"
                      className="bg-white/20 border-white/30 backdrop-blur-sm focus:bg-white/30 focus:border-blue-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Pincode
                    </label>
                    <Input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="Pincode"
                      className="bg-white/20 border-white/30 backdrop-blur-sm focus:bg-white/30 focus:border-blue-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Address Line 1
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      type="text"
                      name="addressLine1"
                      value={formData.addressLine1}
                      onChange={handleChange}
                      placeholder="Street address, building, etc."
                      className="pl-10 bg-white/20 border-white/30 backdrop-blur-sm focus:bg-white/30 focus:border-blue-400"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex space-x-3 pt-4">
              {currentStep > 1 && (
                <GlassButton
                  type="button"
                  variant="ghost"
                  onClick={prevStep}
                  className="flex-1"
                >
                  Previous
                </GlassButton>
              )}

              {currentStep < 2 ? (
                <GlassButton
                  type="button"
                  variant="primary"
                  onClick={nextStep}
                  className="flex-1"
                >
                  Next Step
                  <ArrowRight className="ml-2 h-4 w-4" />
                </GlassButton>
              ) : (
                <GlassButton
                  type="submit"
                  variant="primary"
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </div>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </GlassButton>
              )}
            </div>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-8 text-center"
          >
            <p className="text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link href="/login">
                <span className="text-gradient-primary font-medium hover:underline cursor-pointer">
                  Sign in
                </span>
              </Link>
            </p>
          </motion.div>
        </GlassCard>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-8 grid grid-cols-3 gap-4"
        >
          <GlassCard gradient="secondary" blur="sm" className="p-4 text-center">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">
              Instant Setup
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Get started immediately
            </p>
          </GlassCard>

          <GlassCard gradient="accent" blur="sm" className="p-4 text-center">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">
              Zero Fees
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              No hidden charges
            </p>
          </GlassCard>

          <GlassCard gradient="neutral" blur="sm" className="p-4 text-center">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">
              Expert Support
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Professional guidance
            </p>
          </GlassCard>
        </motion.div>
      </motion.div>
    </div>
  );
}