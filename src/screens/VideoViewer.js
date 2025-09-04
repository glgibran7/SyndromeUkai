// src/screens/VideoViewer.js
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
  Keyboard,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@react-native-vector-icons/ionicons';
import { WebView } from 'react-native-webview';
import Video from 'react-native-video';
import LinearGradient from 'react-native-linear-gradient';
import Api from '../utils/Api'; // pastikan ini axios instance yang benar
import Header from '../components/Header';
import { NativeModules } from 'react-native';
const { FlagSecure } = NativeModules;

const { width, height } = Dimensions.get('window');
const FIVE_MIN_MS = 5 * 60 * 1000;
const ROOT_PAGE_SIZE = 8; // root comments per load

const getDriveDirectLink = url => {
  if (!url) return url;
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) {
    return `https://drive.google.com/uc?export=download&id=${match[1]}`;
  }
  return url;
};

const Avatar = ({ name, size = 28 }) => {
  const initial = name ? String(name).trim()[0].toUpperCase() : '?';
  const bg = '#0b62e4';
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text style={{ color: '#fff', fontWeight: '700' }}>{initial}</Text>
    </View>
  );
};

const VideoViewer = ({ route, navigation }) => {
  useEffect(() => {
    // Aktifkan proteksi
    FlagSecure.enable();

    // Matikan lagi saat keluar
    return () => {
      FlagSecure.disable();
    };
  }, []);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const params = route?.params || {};
  const { id_materi, url_file, title = '', channel = 'UKAI' } = params;

  const [user, setUser] = useState({
    id_user: null,
    nama: 'Peserta',
    paket: 'Premium',
  });

  const [rawComments, setRawComments] = useState([]);
  const [rootComments, setRootComments] = useState([]);
  const [displayedRoots, setDisplayedRoots] = useState([]);
  const [rootPage, setRootPage] = useState(1);
  const [hasMoreRoots, setHasMoreRoots] = useState(false);

  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const [composeText, setComposeText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);

  const [expandedReplies, setExpandedReplies] = useState({});
  const inputRef = useRef(null);

  const safeFocus = () => {
    if (inputRef.current && typeof inputRef.current.focus === 'function') {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const s = await AsyncStorage.getItem('user');
        if (s) {
          const p = JSON.parse(s);
          setUser({
            id_user: p?.id_user ?? null,
            nama: p?.nama ?? 'Peserta',
            paket: p?.paket ?? 'Premium',
          });
        }
      } catch (err) {
        console.warn('read user failed', err);
      }
    })();
  }, []);

  useEffect(() => {
    if (!id_materi) return;
    fetchComments();
  }, [id_materi]);

  useEffect(() => {
    const start = 0;
    const end = rootPage * ROOT_PAGE_SIZE;
    setDisplayedRoots(rootComments.slice(start, end));
    setHasMoreRoots(rootComments.length > end);
  }, [rootComments, rootPage]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await Api.get(`/komentar/${id_materi}/komentar`);
      if (res?.data?.status === 'success') {
        const data = Array.isArray(res.data.data) ? res.data.data : [];
        const map = {};
        data.forEach(c => {
          map[c.id_komentarmateri] = { ...c, replies: [] };
        });
        const roots = [];
        data.forEach(c => {
          if (c.parent_id === null || c.parent_id === undefined) {
            roots.push(map[c.id_komentarmateri]);
          } else if (map[c.parent_id]) {
            map[c.parent_id].replies.push(map[c.id_komentarmateri]);
          } else {
            roots.push(map[c.id_komentarmateri]);
          }
        });
        roots.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        roots.forEach(r =>
          r.replies.sort(
            (a, b) => new Date(a.created_at) - new Date(b.created_at),
          ),
        );
        setRawComments(data);
        setRootComments(roots);
        setRootPage(1);
      } else {
        setRawComments([]);
        setRootComments([]);
      }
    } catch (err) {
      console.error('fetchComments error:', err);
      Alert.alert('Error', 'Gagal memuat komentar. Periksa koneksi/API.');
    } finally {
      setLoading(false);
    }
  };

  const postComment = async () => {
    const text = composeText.trim();
    if (!text) return;
    setSending(true);
    try {
      const payload = {
        isi_komentar: text,
        parent_id: replyingTo ? replyingTo.id_komentarmateri : null,
        id_materi,
      };
      const res = await Api.post(`/komentar/${id_materi}/komentar`, payload);
      if (res?.data?.status === 'success') {
        setComposeText('');
        setReplyingTo(null);
        setEditingComment(null);
        Keyboard.dismiss();
        await fetchComments();
        if (payload.parent_id) {
          setExpandedReplies(prev => ({ ...prev, [payload.parent_id]: true }));
        }
      } else {
        Alert.alert('Gagal', 'Server menolak komentar.');
      }
    } catch (err) {
      console.error('postComment error:', err);
      Alert.alert('Error', 'Gagal mengirim komentar.');
    } finally {
      setSending(false);
    }
  };

  const putEditComment = async () => {
    if (!editingComment) return;
    const text = composeText.trim();
    if (!text) return;
    setSending(true);
    try {
      const res = await Api.put(
        `/komentar/${id_materi}/komentar/${editingComment.id_komentarmateri}`,
        {
          isi_komentar: text,
        },
      );
      if (res?.data?.status === 'success') {
        setComposeText('');
        setEditingComment(null);
        await fetchComments();
      } else {
        Alert.alert('Gagal', 'Server menolak edit.');
      }
    } catch (err) {
      console.error('putEditComment error:', err);
      Alert.alert('Error', 'Gagal mengedit komentar.');
    } finally {
      setSending(false);
    }
  };

  const doDeleteComment = comment => {
    Alert.alert('Hapus komentar', 'Yakin ingin menghapus komentar ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await Api.delete(
              `/komentar/${comment.id_komentarmateri}`,
            );
            if (
              res?.status === 200 ||
              res?.status === 204 ||
              res?.data?.status === 'success'
            ) {
              await fetchComments();
            } else {
              Alert.alert('Gagal', 'Server menolak penghapusan.');
            }
          } catch (err) {
            console.error('delete error', err);
            Alert.alert('Error', 'Gagal menghapus komentar.');
          }
        },
      },
    ]);
  };

  const canEdit = createdAt => {
    if (!createdAt) return false;
    return Date.now() - new Date(createdAt).getTime() <= FIVE_MIN_MS;
  };

  const renderReply = (r, depth = 1) => {
    return (
      <View
        key={`reply-${r.id_komentarmateri}`}
        style={[styles.commentRow, { marginLeft: depth * 52, marginTop: 8 }]}
      >
        <Avatar name={r.nama} size={28} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <View style={styles.rowSpace}>
            <Text style={styles.commentName}>{r.nama}</Text>
            <Text style={styles.commentTime}>
              {new Date(r.created_at).toLocaleString()}
            </Text>
          </View>
          <Text
            style={[styles.commentText, r.is_deleted && styles.commentDeleted]}
          >
            {r.is_deleted
              ? r.deleted_by_mentor
                ? 'Komentar telah dihapus oleh mentor'
                : 'Komentar telah dihapus'
              : r.isi_komentar}
          </Text>
          {/* Tombol edit/hapus/balas reply */}
          {!r.is_deleted && (
            <View style={{ flexDirection: 'row', marginTop: 4 }}>
              {user.id_user === r.id_user && canEdit(r.created_at) && (
                <>
                  <TouchableOpacity
                    onPress={() => {
                      setEditingComment(r);
                      setComposeText(r.isi_komentar);
                      safeFocus();
                    }}
                    style={{ marginRight: 12 }}
                  >
                    <Text style={{ color: '#1976D2', fontWeight: 'bold' }}>
                      Edit
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => doDeleteComment(r)}
                    style={{ marginRight: 12 }}
                  >
                    <Text style={{ color: '#D32F2F', fontWeight: 'bold' }}>
                      Hapus
                    </Text>
                  </TouchableOpacity>
                </>
              )}
              <TouchableOpacity
                onPress={() => {
                  setReplyingTo(r);
                  setComposeText('');
                  safeFocus();
                }}
              >
                <Text style={{ color: '#1976D2', fontWeight: 'bold' }}>
                  Balas
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderRoot = ({ item }) => {
    const repliesCount = item.replies?.length || 0;
    const expanded = !!expandedReplies[item.id_komentarmateri];
    return (
      <View style={styles.rootBox}>
        <View style={styles.commentRow}>
          <Avatar name={item.nama} size={28} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={styles.rowSpace}>
              <Text style={styles.commentName}>{item.nama}</Text>
              <Text style={styles.commentTime}>
                {new Date(item.created_at).toLocaleString()}
              </Text>
            </View>
            <Text
              style={[
                styles.commentText,
                item.is_deleted && styles.commentDeleted,
              ]}
            >
              {item.is_deleted
                ? item.deleted_by_mentor
                  ? 'Komentar telah dihapus oleh mentor'
                  : 'Komentar telah dihapus'
                : item.isi_komentar}
            </Text>
            {/* Tombol edit/hapus/balas root */}
            {!item.is_deleted && (
              <View style={{ flexDirection: 'row', marginTop: 4 }}>
                {user.id_user === item.id_user && canEdit(item.created_at) && (
                  <>
                    <TouchableOpacity
                      onPress={() => {
                        setEditingComment(item);
                        setComposeText(item.isi_komentar);
                        safeFocus();
                      }}
                      style={{ marginRight: 12 }}
                    >
                      <Text style={{ color: '#1976D2', fontWeight: 'bold' }}>
                        Edit
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => doDeleteComment(item)}
                      style={{ marginRight: 12 }}
                    >
                      <Text style={{ color: '#D32F2F', fontWeight: 'bold' }}>
                        Hapus
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
                <TouchableOpacity
                  onPress={() => {
                    setReplyingTo(item);
                    setComposeText('');
                    safeFocus();
                  }}
                >
                  <Text style={{ color: '#1976D2', fontWeight: 'bold' }}>
                    Balas
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
        {repliesCount > 0 && (
          <TouchableOpacity
            style={styles.viewRepliesBtn}
            onPress={() =>
              setExpandedReplies(prev => ({
                ...prev,
                [item.id_komentarmateri]: !expanded,
              }))
            }
          >
            <Text style={styles.viewRepliesText}>
              {expanded
                ? `Sembunyikan balasan (${repliesCount})`
                : `Lihat balasan (${repliesCount})`}
            </Text>
          </TouchableOpacity>
        )}
        {expanded && item.replies.map(r => renderReply(r))}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#9D2828' }}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <Header navigation={navigation} showBack={true} />

        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          {/* Video player */}
          <View style={{ height: height * 0.33, backgroundColor: '#000' }}>
            <Video
              source={{ uri: getDriveDirectLink(url_file) }}
              style={{ width: '100%', height: '100%' }}
              controls
              resizeMode="contain"
              paused={false}
              fullscreen={false}
              onError={e => console.log('Video error', e)}
            />

            {/* Watermark Overlay */}
            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                {
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  flexDirection: 'row',
                  transform: [{ rotate: '-25deg' }],
                  opacity: 0.15,
                },
              ]}
            >
              {Array.from({ length: 40 }).map((_, i) => (
                <Text
                  key={i}
                  style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: 'white',
                    margin: 20,
                    textTransform: 'capitalize',
                  }}
                >
                  {user?.nama || 'User'}
                </Text>
              ))}
            </View>
          </View>

          {/* Wrapper Putih */}
          <View style={styles.whiteWrapper}>
            {/* Info */}
            <View style={styles.infoBox}>
              <Text style={styles.videoTitle}>{title}</Text>
              <Text style={styles.videoMeta}>{channel}</Text>
            </View>

            {/* Komentar Input */}
            <View style={styles.commentInput}>
              <TextInput
                ref={inputRef}
                style={styles.commentTextInput}
                placeholder={
                  editingComment
                    ? 'Edit komentar...'
                    : replyingTo
                    ? `Balas ke ${replyingTo.nama}...`
                    : 'Tulis komentar...'
                }
                value={composeText}
                onChangeText={setComposeText}
                editable={!sending}
                returnKeyType="send"
                onSubmitEditing={() =>
                  editingComment ? putEditComment() : postComment()
                }
              />
              <TouchableOpacity
                style={styles.sendBtn}
                onPress={() =>
                  editingComment ? putEditComment() : postComment()
                }
                disabled={sending || !composeText.trim()}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                  {editingComment ? 'Simpan' : 'Kirim'}
                </Text>
              </TouchableOpacity>
              {(replyingTo || editingComment) && (
                <TouchableOpacity
                  style={{ marginLeft: 8 }}
                  onPress={() => {
                    setReplyingTo(null);
                    setEditingComment(null);
                    setComposeText('');
                  }}
                >
                  <Ionicons name="close-circle" size={24} color="#888" />
                </TouchableOpacity>
              )}
            </View>

            {/* Comments */}
            <View style={styles.commentsSection}>
              <View style={styles.commentsHeader}>
                <Text style={styles.commentsTitle}>Komentar</Text>
                <Text style={styles.commentsCount}>{rawComments.length}</Text>
              </View>
              {loading ? (
                <ActivityIndicator style={{ marginVertical: 20 }} />
              ) : (
                <>
                  {displayedRoots.length === 0 ? (
                    <Text style={{ color: '#666', paddingVertical: 12 }}>
                      Belum ada komentar.
                    </Text>
                  ) : (
                    <FlatList
                      data={displayedRoots}
                      keyExtractor={it => String(it.id_komentarmateri)}
                      renderItem={renderRoot}
                      scrollEnabled={false}
                    />
                  )}
                  {hasMoreRoots && (
                    <TouchableOpacity
                      style={styles.loadMoreBtn}
                      onPress={() => setRootPage(p => p + 1)}
                    >
                      <Text style={styles.loadMoreText}>
                        Muat lebih banyak komentar
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          </View>
          {/* End Wrapper Putih */}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  titleText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textTransform: 'capitalize',
  },

  infoBox: {
    backgroundColor: '#fff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    textTransform: 'capitalize',
  },
  videoMeta: { fontSize: 12, color: '#666', marginTop: 6 },

  commentsSection: {
    padding: 12,
    backgroundColor: '#fff',
    marginTop: 6,
    paddingBottom: 40,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentsTitle: { fontSize: 16, fontWeight: '700' },
  commentsCount: { color: '#666' },

  rootBox: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f3f3',
  },
  commentRow: { flexDirection: 'row', alignItems: 'flex-start' },
  rowSpace: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commentName: { fontWeight: '700', fontSize: 14, textTransform: 'capitalize' },
  commentTime: { fontSize: 11, color: '#777', marginLeft: 8 },
  commentText: { marginTop: 6, color: '#222', fontSize: 14 },
  commentDeleted: { fontStyle: 'italic', color: '#999' },

  viewRepliesBtn: { marginTop: 6 },
  viewRepliesText: { color: '#1f7af7' },

  loadMoreBtn: {
    marginTop: 12,
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
  },
  loadMoreText: { color: '#1976D2', fontWeight: '700' },
  whiteWrapper: {
    backgroundColor: '#fff',
    overflow: 'hidden',
    height: '100%',
  },

  commentInput: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },

  commentTextInput: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
    color: '#222',
  },
  sendBtn: {
    marginLeft: 10,
    backgroundColor: '#1976D2',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
  },
});

export default VideoViewer;
