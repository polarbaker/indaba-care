import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  Alert
} from 'react-native';
import { 
  Button, 
  TextInput, 
  Title, 
  Text, 
  HelperText,
  ActivityIndicator
} from 'react-native-paper';
import { useAuthContext } from '../../contexts/AuthContext';

type Props = {
  navigation: any;
};

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  
  const { signIn } = useAuthContext();
  
  const validateForm = (): boolean => {
    let isValid = true;
    
    // Email validation
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    } else {
      setEmailError('');
    }
    
    // Password validation
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else {
      setPasswordError('');
    }
    
    return isValid;
  };
  
  const handleLogin = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      await signIn(email, password);
      navigation.navigate('Main');
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error.message || 'Please check your credentials and try again'
      );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/logo-placeholder.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          
          <Title style={styles.title}>Welcome to Indaba Care</Title>
          <Text style={styles.subtitle}>Sign in to continue</Text>
          
          <View style={styles.form}>
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              error={!!emailError}
              disabled={loading}
            />
            {emailError ? <HelperText type="error">{emailError}</HelperText> : null}
            
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry={secureTextEntry}
              error={!!passwordError}
              disabled={loading}
              right={
                <TextInput.Icon 
                  name={secureTextEntry ? "eye" : "eye-off"}
                  onPress={() => setSecureTextEntry(!secureTextEntry)}
                />
              }
            />
            {passwordError ? <HelperText type="error">{passwordError}</HelperText> : null}
            
            <Button
              mode="text"
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotPasswordButton}
              labelStyle={styles.forgotPasswordText}
            >
              Forgot Password?
            </Button>
            
            <Button
              mode="contained"
              onPress={handleLogin}
              style={styles.loginButton}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator animating={true} color="white" />
              ) : (
                'Sign In'
              )}
            </Button>
            
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <Button
                mode="text"
                onPress={() => navigation.navigate('Register')}
                labelStyle={styles.registerButton}
              >
                Create Account
              </Button>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  input: {
    marginBottom: 10,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 14,
  },
  loginButton: {
    marginBottom: 20,
    paddingVertical: 8,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  registerText: {
    fontSize: 14,
    color: '#666',
  },
  registerButton: {
    fontSize: 14,
  },
});
