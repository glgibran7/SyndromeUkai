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
import Api from '../utils/Api'; // pastikan ini axios instance yang benar

const { width, height } = Dimensions.get('window');
const FIVE_MIN_MS = 5 * 60 * 1000;
const ROOT_PAGE_SIZE = 8; // root comments per load

const safeFocus = () => {
  if (inputRef.current && typeof inputRef.current.focus === 'function') {
    inputRef.current.focus();
  }
};

const getDrivePreview = url => {
  if (!url) return url;
  const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return m ? `https://drive.google.com/file/d/${m[1]}/preview` : url;
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
  const params = route?.params || {};
  const {
    id_materi,
    url_file,
    title = '',
    channel = 'UKAI',
    views = '0',
    time = '',
    avatar = null,
  } = params;

  const [user, setUser] = useState({
    id_user: null,
    nama: 'Peserta',
    paket: 'Premium',
  });

  const [rawComments, setRawComments] = useState([]); // flat from API
  const [rootComments, setRootComments] = useState([]); // nested roots
  const [displayedRoots, setDisplayedRoots] = useState([]);
  const [rootPage, setRootPage] = useState(1);
  const [hasMoreRoots, setHasMoreRoots] = useState(false);

  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const [composeText, setComposeText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null); // object of comment
  const [editingComment, setEditingComment] = useState(null); // object of comment

  const [expandedReplies, setExpandedReplies] = useState({}); // map id -> bool

  const inputRef = useRef(null);

  const [dropdownVisible, setDropdownVisible] = useState(false);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user');
    navigation.replace('Login');
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
    // update displayed roots for current page
    const start = 0;
    const end = rootPage * ROOT_PAGE_SIZE;
    setDisplayedRoots(rootComments.slice(start, end));
    setHasMoreRoots(rootComments.length > end);
  }, [rootComments, rootPage]);

  // ---------- API actions ----------
  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await Api.get(`/komentar/${id_materi}/komentar`);
      if (res?.data?.status === 'success') {
        // sort raw so newest roots show on top. We'll build nested after sorting.
        const data = Array.isArray(res.data.data) ? res.data.data : [];
        // Build map and nested. Important: We want roots sorted DESC by created_at (newest first)
        // Replies will be sorted ASC (oldest first).
        // First, create map objects
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
            // fallback: treat as root
            roots.push(map[c.id_komentarmateri]);
          }
        });

        // sort roots newest first
        roots.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        // sort replies oldest first
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

            // sukses kalau 200/204 atau ada status success
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
  // ---------- helpers ----------
  const canEdit = createdAt => {
    if (!createdAt) return false;
    return Date.now() - new Date(createdAt).getTime() <= FIVE_MIN_MS;
  };

  const onReply = c => {
    setReplyingTo(c);
    setEditingComment(null);
    setComposeText('');
    setTimeout(safeFocus, 200);
  };

  const onEdit = c => {
    setEditingComment(c);
    setReplyingTo(null);
    setComposeText(c.isi_komentar || '');
    setTimeout(safeFocus, 200);
  };

  const onCancelCompose = () => {
    setComposeText('');
    setReplyingTo(null);
    setEditingComment(null);
    Keyboard.dismiss();
  };

  const toggleReplies = id => {
    setExpandedReplies(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const loadMoreRoots = () => {
    if (hasMoreRoots) setRootPage(p => p + 1);
  };

  // ---------- render UI components ----------
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

          <View style={styles.actionRow}>
            {!r.is_deleted && (
              <TouchableOpacity onPress={() => onReply(r)}>
                <Text style={styles.actionText}>Balas</Text>
              </TouchableOpacity>
            )}
            {user.id_user &&
              r.id_user === user.id_user &&
              !r.is_deleted &&
              canEdit(r.created_at) && (
                <TouchableOpacity onPress={() => onEdit(r)}>
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
              )}
            {user.id_user && r.id_user === user.id_user && !r.is_deleted && (
              <TouchableOpacity onPress={() => doDeleteComment(r)}>
                <Text style={[styles.actionText, { color: 'red' }]}>Hapus</Text>
              </TouchableOpacity>
            )}
          </View>
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

            <View style={styles.actionRow}>
              {!item.is_deleted && (
                <TouchableOpacity onPress={() => onReply(item)}>
                  <Text style={styles.actionText}>Balas</Text>
                </TouchableOpacity>
              )}
              {user.id_user &&
                item.id_user === user.id_user &&
                !item.is_deleted &&
                canEdit(item.created_at) && (
                  <TouchableOpacity onPress={() => onEdit(item)}>
                    <Text style={styles.actionText}>Edit</Text>
                  </TouchableOpacity>
                )}
              {user.id_user &&
                item.id_user === user.id_user &&
                !item.is_deleted && (
                  <TouchableOpacity onPress={() => doDeleteComment(item)}>
                    <Text style={[styles.actionText, { color: 'red' }]}>
                      Hapus
                    </Text>
                  </TouchableOpacity>
                )}
            </View>
          </View>
        </View>

        {repliesCount > 0 && (
          <TouchableOpacity
            style={styles.viewRepliesBtn}
            onPress={() => toggleReplies(item.id_komentarmateri)}
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

  // compute hasMoreRoots from rootComments array and rootPage
  const endIndex = rootPage * ROOT_PAGE_SIZE;
  const totalRoots = rootComments.length;
  useEffect(() => {
    setHasMoreRoots(totalRoots > endIndex);
  }, [rootComments, rootPage, totalRoots]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#9D2828' }}>
      <View style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" backgroundColor="#a10505" />
        {/* Header same as VideoListScreen */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              try {
                if (navigation?.canGoBack?.()) {
                  navigation.goBack();
                } else if (navigation?.navigate) {
                  navigation.navigate('Home');
                }
              } catch (e) {
                navigation?.reset?.({ index: 0, routes: [{ name: 'Home' }] });
              }
            }}
          >
            <Ionicons name="arrow-back" size={26} color="#fff" />
          </TouchableOpacity>

          <Image
            source={require('../../src/img/logo_putih.png')}
            style={styles.logo}
          />

          <View style={styles.userInfo}>
            <TouchableOpacity
              style={styles.avatarInitial}
              onPress={() => setDropdownVisible(!dropdownVisible)}
            >
              <Text style={styles.avatarText}>{(user.nama || 'P')[0]}</Text>
            </TouchableOpacity>

            {dropdownVisible && (
              <View style={styles.dropdown}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setDropdownVisible(false);
                    navigation.navigate('Profile');
                  }}
                >
                  <Text style={styles.dropdownText}>Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={handleLogout}
                >
                  <Text style={styles.dropdownText}>Logout</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{
            paddingBottom: 120,
            keyboardShouldPersistTaps: 'handled',
          }}
        >
          {/* Video player */}
          <View style={{ height: height * 0.33, backgroundColor: '#000' }}>
            <WebView
              source={{ uri: getDrivePreview(url_file) }}
              style={{ flex: 1 }}
              javaScriptEnabled
              allowsFullscreenVideo
              mediaPlaybackRequiresUserAction={false}
              // Disable long press and context menu
              injectedJavaScript={`
              document.addEventListener('contextmenu', event => event.preventDefault());
              document.addEventListener('copy', event => event.preventDefault());
              document.addEventListener('dragstart', event => event.preventDefault());
              document.body.style.userSelect = 'none';
              document.body.style.webkitUserSelect = 'none';
              document.body.style.msUserSelect = 'none';
            `}
              onMessage={() => {}}
            />
            {/* Watermark overlay */}
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: 'rgba(255,0,0,0.18)',
                  fontSize: 32,
                  fontWeight: 'bold',
                  transform: [{ rotate: '-20deg' }],
                  textAlign: 'center',
                }}
              >
                {user.nama}
              </Text>
            </View>
          </View>

          {/* Info */}
          <View style={styles.infoBox}>
            <Text style={styles.videoTitle}>{title}</Text>
            <Text style={styles.videoMeta}>
              {channel}
              {/* {channel} • {views} views • {time} */}
            </Text>
          </View>

          {/* Comments input (YouTube style) */}
          <View style={styles.commentComposer}>
            <Avatar name={user.nama} size={40} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <TextInput
                ref={inputRef}
                style={styles.composeInput}
                placeholder={
                  editingComment
                    ? 'Edit komentar...'
                    : replyingTo
                    ? `Balas ke ${replyingTo.nama}`
                    : 'Tambahkan komentar...'
                }
                placeholderTextColor="#999"
                value={composeText}
                onChangeText={setComposeText}
                multiline
              />
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: 8,
                  alignItems: 'center',
                }}
              >
                {(replyingTo || editingComment) && (
                  <TouchableOpacity
                    onPress={onCancelCompose}
                    style={{ marginRight: 12 }}
                  >
                    <Text style={{ color: '#666' }}>Batal</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => {
                    if (editingComment) putEditComment();
                    else postComment();
                  }}
                  style={[styles.sendButton, sending && { opacity: 0.6 }]}
                  disabled={sending}
                >
                  <Text style={{ color: '#fff', fontWeight: '700' }}>
                    {sending ? '...' : 'Kirim'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Comments list */}
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
                    scrollEnabled={false} // parent scroll handles
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
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    alignItems: 'center',
    //justifyContent: 'space-between',
    // backgroundColor: '#9D2828',
  },
  logo: {
    width: width * 0.3,
    height: width * 0.3,
    resizeMode: 'contain',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    right: 20,
  },
  paketBadge: {
    backgroundColor: '#feb600',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  paketText: { fontSize: 12, color: '#fff', fontWeight: 'bold' },
  avatarInitial: {
    width: 35,
    height: 35,
    borderRadius: 999,
    backgroundColor: '#0b62e4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
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

  commentComposer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: '#fff',
  },
  composeInput: {
    minHeight: 44,
    maxHeight: 120,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e6e6e6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    color: '#000',
  },
  sendButton: {
    backgroundColor: '#a10505',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },

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

  actionRow: { flexDirection: 'row', marginTop: 8 },
  actionText: { color: '#1976D2', marginRight: 16, fontWeight: '600' },

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

  dropdown: {
    position: 'absolute',
    top: 45,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    zIndex: 999,
    width: 160,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownText: { fontSize: 15, color: '#000' },
});

export default VideoViewer;
