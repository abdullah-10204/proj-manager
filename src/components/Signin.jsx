"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import Cookies from 'js-cookie';

function SigninUser() {
  const router = useRouter();
  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const [submitAttempted, setSubmitAttempted] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const { email, password } = formData;

      const expires = new Date();
      expires.setDate(expires.getDate() + 7);

      if (email === "adminuser123@gmail.com" && password === "admin123") {
        Cookies.set('Role', 'Admin', { expires, secure: true, sameSite: 'strict' });
        Cookies.set('isAuthenticated', 'true', { expires, secure: true, sameSite: 'strict' });
        router.push("/dashboard");
      } else if (email === "user123@gmail.com" && password === "user123") {
        Cookies.set('Role', 'User', { expires, secure: true, sameSite: 'strict' });
        Cookies.set('isAuthenticated', 'true', { expires, secure: true, sameSite: 'strict' });
        router.push("/dashboard");
      } else {
        setErrors({ submit: "Invalid email or password" });
      }
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex h-auto min-h-screen w-full">
      <div className="md:flex w-[40%] h-auto min-h-screen relative hidden items-start justify-center">
        <Image
          src="/signin.jpg"
          alt="signin"
          fill
          className="object-cover overflow-clip"
        />
      </div>
      <div className="w-full md:w-[60%] h-auto min-h-screen bg-[var(--bg-color)] flex items-center justify-center md:p-5 p-2">
        <div className="w-full max-w-[550px] bg-white rounded-[20px] md:px-8 px-2 py-9 flex flex-col gap-[20px] my-8">
          <div>
            <p className="text-4xl leading-[50px] font-bold">
              Sign in to your dashboard
            </p>
            <p className="text-[16px] text-[var(--text-light-color)] leading-6">
              Launch, track, and manage your projects with ease.
            </p>
          </div>

          {errors.submit && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {errors.submit}
            </div>
          )}

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-[16px] font-semibold text-[var(--text-dark-color)]"
              >
                Business Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your business email"
                  className={`w-full border ${submitAttempted && errors.email
                    ? "border-red-500"
                    : "border-[var(--border-color)]"
                    } rounded-[58px] p-4 pl-12 pr-12 focus:outline-none focus:border-[var(--primary-color)] placeholder:text-gray-400 placeholder:text-[16px] placeholder:leading-6`}
                />
                <Mail
                  className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${submitAttempted && errors.email
                    ? "text-red-500"
                    : "text-gray-600"
                    }`}
                  size={20}
                />
                {submitAttempted && errors.email && (
                  <AlertCircle
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-red-500"
                    size={20}
                  />
                )}
              </div>
              {submitAttempted && errors.email && (
                <p className="text-red-500 text-sm pl-4">{errors.email}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="password"
                className="text-[16px] font-semibold text-[var(--text-dark-color)]"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`w-full border ${submitAttempted && errors.password
                    ? "border-red-500"
                    : "border-[var(--border-color)]"
                    } rounded-[58px] p-4 pl-12 pr-12 focus:outline-none focus:border-[var(--primary-color)] placeholder:text-gray-400 placeholder:text-[16px] placeholder:leading-6`}
                />
                <Lock
                  className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${submitAttempted && errors.password
                    ? "text-red-500"
                    : "text-gray-600"
                    }`}
                  size={20}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {submitAttempted && errors.password && (
                <p className="text-red-500 text-sm pl-4">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`mt-4 w-full py-4 px-6 rounded-[58px] text-white font-semibold cursor-pointer flex items-center justify-center gap-2 ${loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-[#003366]  hover:bg-[#003366]"
                }`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SigninUser;
