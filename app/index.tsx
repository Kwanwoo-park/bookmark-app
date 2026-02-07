import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onLogin = async () => {
    if (!email || !password) return;

    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // ✅ 서버에서 쿠키(access_token, refresh_token) 내려줌
        credentials: 'include',
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!res.ok) {
        throw new Error('login failed');
      }

      const data = await res.json();
      /**
       * 서버 AuthService.login() 반환값 기준
       * 보통:
       * {
       *   id: number,
       *   email: string,
       *   ...
       * }
       */

      // ❌ email 기준 이동 (서버 기준 아님)
      // router.push({ pathname: '/main', params: { email } });

      // ✅ member id 기준 이동
      router.push({
        pathname: '/main',
        params: { id: data.id },
      });

    } catch (err) {
      Alert.alert('로그인 실패', '이메일 또는 비밀번호를 확인하세요');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{
        flex: 1,
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <Text style={{ fontSize: 26, fontWeight: '600', marginBottom: 30 }}>
        로그인
      </Text>

      <TextInput
        placeholder="이메일"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={{
          borderBottomWidth: 1,
          paddingVertical: 10,
          marginBottom: 20,
        }}
      />

      <TextInput
        placeholder="비밀번호"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{
          borderBottomWidth: 1,
          paddingVertical: 10,
          marginBottom: 30,
        }}
      />

      <TouchableOpacity
        onPress={onLogin}
        style={{
          backgroundColor: '#000',
          padding: 14,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: '#fff', textAlign: 'center', fontSize: 16 }}>
          로그인
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}
