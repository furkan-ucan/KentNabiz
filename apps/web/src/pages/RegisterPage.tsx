import React, { useEffect } from 'react';
import { Formik, Form, Field, FieldProps } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/store';
import {
  Box,
  Button,
  Card,
  Container,
  Heading,
  HStack,
  Input,
  Stack,
  Text,
} from '@chakra-ui/react';
import { Field as ChakraField } from '@/components/ui/field';
import { registerUser } from '@/store/thunks/authThunks';
import {
  clearAuthError,
  selectAuthStatus,
  selectAuthError,
  selectIsAuthenticated,
} from '@/store/slices/authSlice';
import { RegisterRequest } from '@KentNabiz/shared';

// Validation schema
const registerSchema = Yup.object().shape({
  fullName: Yup.string()
    .min(2, 'Ad Soyad en az 2 karakter olmalıdır')
    .required('Ad Soyad zorunludur'),
  email: Yup.string()
    .email('Geçerli bir e-posta adresi giriniz')
    .required('E-posta adresi zorunludur'),
  password: Yup.string()
    .min(6, 'Şifre en az 6 karakter olmalıdır')
    .required('Şifre zorunludur'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Şifreler eşleşmiyor')
    .required('Şifre tekrarı zorunludur'),
});

interface RegisterFormValues extends Omit<RegisterRequest, 'phoneNumber'> {
  confirmPassword: string;
}

const RegisterPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const status = useSelector(selectAuthStatus);
  const error = useSelector(selectAuthError);

  const isLoading = status === 'loading';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app');
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleSubmit = async (values: RegisterFormValues) => {
    // Remove confirmPassword before sending to API
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...registerData } = values;
    dispatch(registerUser(registerData));
  };

  return (
    <Container
      maxW="lg"
      py={{ base: '12', md: '24' }}
      px={{ base: '0', sm: '8' }}
    >
      <Stack gap="8">
        <Stack gap="6">
          <Stack gap={{ base: '2', md: '3' }} textAlign="center">
            <Heading size={{ base: 'xs', md: 'sm' }}>
              KentNabız&apos;a Kayıt Olun
            </Heading>
            <Text color="fg.muted">
              Hesap oluşturarak şehir sorunlarını raporlamaya başlayın
            </Text>
          </Stack>
        </Stack>

        <Box py={{ base: '0', sm: '8' }} px={{ base: '4', sm: '10' }}>
          <Card.Root>
            <Card.Body>
              <Stack gap="6">
                <Formik
                  initialValues={{
                    fullName: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                  }}
                  validationSchema={registerSchema}
                  onSubmit={handleSubmit}
                >
                  {({ errors, touched, isValid, dirty }) => (
                    <Form>
                      <Stack gap="5">
                        <Stack gap="4">
                          <ChakraField
                            label="Ad Soyad"
                            invalid={!!(touched.fullName && errors.fullName)}
                            errorText={
                              touched.fullName ? errors.fullName : undefined
                            }
                          >
                            <Field name="fullName">
                              {({ field }: FieldProps) => (
                                <Input
                                  {...field}
                                  type="text"
                                  placeholder="Adınız ve Soyadınız"
                                />
                              )}
                            </Field>
                          </ChakraField>

                          <ChakraField
                            label="E-posta"
                            invalid={!!(touched.email && errors.email)}
                            errorText={touched.email ? errors.email : undefined}
                          >
                            <Field name="email">
                              {({ field }: FieldProps) => (
                                <Input
                                  {...field}
                                  type="email"
                                  placeholder="ornek@email.com"
                                />
                              )}
                            </Field>
                          </ChakraField>

                          <ChakraField
                            label="Şifre"
                            invalid={!!(touched.password && errors.password)}
                            errorText={
                              touched.password ? errors.password : undefined
                            }
                          >
                            <Field name="password">
                              {({ field }: FieldProps) => (
                                <Input
                                  {...field}
                                  type="password"
                                  placeholder="En az 6 karakter"
                                />
                              )}
                            </Field>
                          </ChakraField>

                          <ChakraField
                            label="Şifre Tekrarı"
                            invalid={
                              !!(
                                touched.confirmPassword &&
                                errors.confirmPassword
                              )
                            }
                            errorText={
                              touched.confirmPassword
                                ? errors.confirmPassword
                                : undefined
                            }
                          >
                            <Field name="confirmPassword">
                              {({ field }: FieldProps) => (
                                <Input
                                  {...field}
                                  type="password"
                                  placeholder="Şifrenizi tekrar girin"
                                />
                              )}
                            </Field>
                          </ChakraField>
                        </Stack>

                        {error && (
                          <Box
                            p="3"
                            bg="red.50"
                            borderWidth="1px"
                            borderColor="red.200"
                            borderRadius="md"
                          >
                            <Text color="red.700" fontSize="sm">
                              {error}
                            </Text>
                          </Box>
                        )}

                        <Stack gap="6">
                          <Button
                            type="submit"
                            colorPalette="blue"
                            loading={isLoading}
                            disabled={!isValid || !dirty || isLoading}
                            width="full"
                          >
                            Kayıt Ol
                          </Button>
                        </Stack>
                      </Stack>
                    </Form>
                  )}
                </Formik>
              </Stack>
            </Card.Body>
          </Card.Root>
        </Box>

        <HStack gap="1" justify="center">
          <Text color="fg.muted">Zaten hesabınız var mı?</Text>
          <Button variant="plain" size="sm" asChild>
            <Link to="/login">Giriş Yapın</Link>
          </Button>
        </HStack>
      </Stack>
    </Container>
  );
};

export default RegisterPage;
