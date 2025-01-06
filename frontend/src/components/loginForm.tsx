// filepath: /c:/Users/sanan/dev/applitrack-v2/frontend/src/components/loginForm.tsx
import { useForm } from "react-hook-form";
import { FormData } from '@/types';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '@/store/authStore';

const LoginForm = () => {
  const { toast } = useToast();
  const form = useForm<FormData>();
  const navigate = useNavigate();
  const setIsAuthenticated = useAuthStore((state) => state.setIsAuthenticated);

  const handleLogin = async (data: FormData) => {
    try {
      /* get api url  */
      const apiUrl = import.meta.env.VITE_API_URL;
      /* post the formdata */
      const response = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      const result = await response.json();

      // Save the JWT token in local storage
      localStorage.setItem('authToken', result.authData.token);

      toast({
        title: 'Success',
        description: 'Redirecting to dashboard...',
        duration: 800,
        variant: "default"
      });

      // Delay the following actions by 1 second
      setTimeout(() => {
        // Update the authentication state
        setIsAuthenticated(true);

        // Redirect to the dashboard page
        navigate({ to: '/dashboard' });
      }, 1000);

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: "destructive"
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-8">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='flex justify-end'>
          <Button className='hover:scale-110' type="submit">Log in</Button>
        </div>
      </form>
    </Form>
  );
};

export default LoginForm;