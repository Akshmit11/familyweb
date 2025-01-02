const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
      <div className="min-h-screen w-full flex justify-center items-center geistSans">
        {children}
      </div>
    )
  }
  
  export default AuthLayout