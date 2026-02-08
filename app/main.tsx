// ❌ 서버에 이미지 관련 API 없음
// import * as ImagePicker from 'expo-image-picker';

import { useEffect, useState } from 'react';
import {
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Board = {
  id: number;
  description: string;
  url: string;
};

export default function MainScreen() {
  // ⚠️ 서버는 member id 기준
  const [memberId, setMemberId] = useState<number | null>(null);
  const [memberName, setMemberName] = useState<string | null>(null);

  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [boards, setBoards] = useState<Board[]>([]);

  const getMember = async() => {
    try {
      let res = await fetch(
        `http://localhost:3000/api/member/token`,
        {
          method: 'GET',
          credentials: 'include'
        }
      );

      if (res.status === 401) {
        const refresh = await fetch(
          `http://localhost:3000/api/auth/refresh`,
          {
            method: 'POST',
            credentials: 'include',
          }
        );

        if (refresh.ok) {
          res = await fetch(
            `http://localhost:3000/api/member/token`
          )
        }
      }

      const data = await res.json();

      setMemberId(data.id);
      setMemberName(data.name);
    } catch (err) {
      console.error(err);
    }
  };

  /** 게시글 목록 조회 */
  const fetchBoards = async () => {
   try {
      const res = await fetch(
        `http://localhost:3000/api/board/view/${memberId}`,
      );
      const data = await res.json();
      setBoards(data);
    } catch (err) {
      console.error(err);
    }
  };

  /** 게시글 생성 */
  const createBoard = async () => {
    if (!description || !url) return;

    try {
      const res = await fetch(
        `http://localhost:3000/api/board/create/${memberId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            description,
            url,
          }),
        },
      );

      const saved = await res.json();
      setBoards((prev) => [saved, ...prev]);

      setDescription('');
      setUrl('');
    } catch (err) {
      console.error(err);
    }
  };

  /** URL 이동 */
  const openUrl = (url: string) => {
    Linking.openURL(url);
  };

  useEffect(() => {
    getMember();

    if (memberId !== null)
      fetchBoards();
  }, []);

  return (
    <View style={styles.container}>
      {/* 상단 사용자 정보 */}
      <Text style={styles.user}>👤 Member #{memberName}</Text>

      {/* 입력 영역 */}
      <View style={styles.form}>
        <TextInput
          placeholder="북마크 이름"
          value={description}
          onChangeText={setDescription}
          style={styles.input}
        />

        <TextInput
          placeholder="https://example.com"
          value={url}
          onChangeText={setUrl}
          autoCapitalize="none"
          style={styles.input}
        />

        <TouchableOpacity style={styles.addBtn} onPress={createBoard}>
          <Text style={{ color: '#fff' }}>등록</Text>
        </TouchableOpacity>
      </View>

      {/* 북마크 Grid */}
      <FlatList
        data={boards}
        numColumns={3}
        keyExtractor={(item) => item.id.toString()}
        columnWrapperStyle={{ gap: 10 }}
        contentContainerStyle={{ gap: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => openUrl(item.url)}
          >
            {/* ❌ 서버에 image 필드 없음 */}
            {/* <Image ... /> */}

            <View style={styles.placeholder}>
              <Text>🔗</Text>
            </View>

            <Text numberOfLines={1} style={styles.title}>
              {item.description}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

/* ================= 스타일 ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 14,
  },
  user: {
    fontSize: 16,
    marginBottom: 10,
  },
  form: {
    marginBottom: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  addBtn: {
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  card: {
    width: '32%',
  },
  placeholder: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginTop: 4,
    fontSize: 12,
    textAlign: 'center',
  },
});
