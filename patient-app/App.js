import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  StatusBar, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { io } from 'socket.io-client';

// CRITICAL FIX: Configured directly to the user's host machine LAN IP
const BACKEND_URL = 'http://192.168.1.48:5000';

export default function App() {
  const [authMode, setAuthMode] = useState('ticket'); // 'ticket' or 'account'
  const [ticketInput, setTicketInput] = useState('CW-101');
  const [emailInput, setEmailInput] = useState('patient@hospital.com');
  const [passwordInput, setPasswordInput] = useState('patient123');
  
  const [session, setSession] = useState(null); // { user, token, ticketNumber }
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [notification, setNotification] = useState(null);

  // Fetch ticket details from the backend
  const fetchTicketDetails = async (ticket) => {
    if (!ticket) return;
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/patients/ticket/${ticket.trim().toUpperCase()}`);
      if (res.ok) {
        const data = await res.json();
        setTicketData(data);
        setSession(prev => ({
          ...(prev || {}),
          ticketNumber: data.ticketNumber,
          user: { name: data.name, role: 'PATIENT' }
        }));
      } else {
        const err = await res.json();
        Alert.alert('Ticket Lookup', err.error || 'Ticket not found.');
      }
    } catch (e) {
      console.warn('Network error reaching backend:', e);
      Alert.alert(
        'Connection Error', 
        `Could not reach CareWell server at ${BACKEND_URL}.\nEnsure your phone is on the same Wi-Fi network.`
      );
    } finally {
      setLoading(false);
    }
  };

  // Login via Email/Password
  const handleAccountLogin = async () => {
    if (!emailInput || !passwordInput) {
      Alert.alert('Required', 'Please enter email and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput.trim(), password: passwordInput })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setSession({ user: data.user, token: data.token });
        // If user has a ticket or default CW-101
        fetchTicketDetails(data.user.ticketNumber || 'CW-101');
      } else {
        Alert.alert('Login Failed', data.error || 'Invalid credentials.');
      }
    } catch (err) {
      Alert.alert('Connection Error', `Cannot connect to ${BACKEND_URL}`);
    } finally {
      setLoading(false);
    }
  };

  // Ticket Direct Login
  const handleTicketLogin = () => {
    if (!ticketInput.trim()) {
      Alert.alert('Enter Ticket', 'Please enter your ticket (e.g. CW-101)');
      return;
    }
    fetchTicketDetails(ticketInput.trim());
  };

  // Socket.io for live updates
  useEffect(() => {
    const socket = io(BACKEND_URL, { 
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 8,
      timeout: 10000 
    });

    socket.on('connect', () => {
      setSocketConnected(true);
      if (ticketData?.id) {
        socket.emit('join:patient', ticketData.id);
      }
    });

    socket.on('disconnect', () => setSocketConnected(false));

    socket.on('queue:updated', () => {
      if (ticketData?.ticketNumber) {
        fetchTicketDetails(ticketData.ticketNumber);
      }
    });

    socket.on('patient:discharged', (payload) => {
      if (payload.patientId === ticketData?.id || payload.ticketNumber === ticketData?.ticketNumber) {
        setNotification({
          title: 'Consultation Finalized 📋',
          message: `Dr. ${payload.doctorName || 'Clinician'} has concluded your consultation. Review your prescription and follow-up below.`
        });
        fetchTicketDetails(ticketData.ticketNumber);
      }
    });

    return () => socket.disconnect();
  }, [ticketData?.id, ticketData?.ticketNumber]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>CW</Text>
          </View>
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text style={styles.hospitalTitle}>CareWell Hospital</Text>
            <Text style={styles.hospitalSubtitle}>Patient Companion Portal</Text>
          </View>
        </View>

        {/* Live indicator & IP pill */}
        <View style={styles.headerRight}>
          <View style={[styles.networkBadge, { borderColor: socketConnected ? '#2D6A4F' : '#E2E8F0' }]}>
            <View style={[styles.statusDot, { backgroundColor: socketConnected ? '#10B981' : '#F59E0B' }]} />
            <Text style={styles.ipText}>192.168.1.48:5000</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* If Not Logged In / No Active Ticket */}
        {!ticketData ? (
          <View style={styles.loginContainer}>
            <View style={styles.authToggle}>
              <TouchableOpacity 
                style={[styles.toggleBtn, authMode === 'ticket' && styles.toggleBtnActive]}
                onPress={() => setAuthMode('ticket')}
              >
                <Text style={[styles.toggleText, authMode === 'ticket' && styles.toggleTextActive]}>
                  Ticket Lookup
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.toggleBtn, authMode === 'account' && styles.toggleBtnActive]}
                onPress={() => setAuthMode('account')}
              >
                <Text style={[styles.toggleText, authMode === 'account' && styles.toggleTextActive]}>
                  Patient Login
                </Text>
              </TouchableOpacity>
            </View>

            {authMode === 'ticket' ? (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Instant Ticket Tracking</Text>
                <Text style={styles.cardSubtitle}>
                  Enter the OPD ticket number issued at the hospital reception counter.
                </Text>

                <Text style={styles.inputLabel}>OPD Ticket Number</Text>
                <TextInput
                  style={styles.input}
                  value={ticketInput}
                  onChangeText={setTicketInput}
                  placeholder="e.g. CW-101"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="characters"
                />

                <View style={styles.quickPills}>
                  {['CW-101', 'CW-102', 'CW-103', 'CW-104'].map(t => (
                    <TouchableOpacity 
                      key={t} 
                      style={styles.quickPill}
                      onPress={() => { setTicketInput(t); fetchTicketDetails(t); }}
                    >
                      <Text style={styles.quickPillText}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity 
                  style={styles.primaryButton}
                  onPress={handleTicketLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Track Queue Status</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Patient Portal Sign In</Text>
                <Text style={styles.cardSubtitle}>Access your registered medical appointment history.</Text>

                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  value={emailInput}
                  onChangeText={setEmailInput}
                  placeholder="patient@hospital.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  style={styles.input}
                  value={passwordInput}
                  onChangeText={setPasswordInput}
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry
                />

                <TouchableOpacity 
                  style={styles.primaryButton}
                  onPress={handleAccountLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Sign In</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          /* Active Ticket View */
          <View>
            {/* Top Switch / Sign out Bar */}
            <View style={styles.userBanner}>
              <View>
                <Text style={styles.welcomeText}>Patient: <Text style={{ fontWeight: 'bold' }}>{ticketData.name}</Text></Text>
                <Text style={styles.ticketSub}>Ticket: {ticketData.ticketNumber}</Text>
              </View>
              <TouchableOpacity 
                style={styles.switchButton}
                onPress={() => { setTicketData(null); setSession(null); setNotification(null); }}
              >
                <Text style={styles.switchText}>Change Ticket</Text>
              </TouchableOpacity>
            </View>

            {/* Notification Alert */}
            {notification && (
              <View style={styles.notifBanner}>
                <Text style={styles.notifTitle}>{notification.title}</Text>
                <Text style={styles.notifBody}>{notification.message}</Text>
              </View>
            )}

            {/* Live Queue Ticket Card */}
            <View style={styles.ticketCard}>
              <View style={styles.ticketCardHeader}>
                <View>
                  <Text style={styles.ticketNumberText}>{ticketData.ticketNumber}</Text>
                  <Text style={styles.ticketSubhead}>OPD General Consultation</Text>
                </View>
                <View style={[
                  styles.statusBadge, 
                  ticketData.status === 'DISCHARGED' ? styles.statusGreen : styles.statusAmber
                ]}>
                  <Text style={styles.statusBadgeText}>
                    {ticketData.status === 'DISCHARGED' ? 'COMPLETED' : 'WAITING'}
                  </Text>
                </View>
              </View>

              <View style={styles.lineDivider} />

              {ticketData.status !== 'DISCHARGED' ? (
                <View style={styles.statsRow}>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>{ticketData.queuePosition}</Text>
                    <Text style={styles.statLabel}>Position in Queue</Text>
                  </View>
                  <View style={styles.verticalDivider} />
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>~{ticketData.estimatedWaitMinutes}m</Text>
                    <Text style={styles.statLabel}>Est. Wait Time</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.concludedBanner}>
                  <Text style={styles.concludedTitle}>✓ Consultation Completed</Text>
                  <Text style={styles.concludedSub}>Please proceed to the pharmacy if medications were prescribed.</Text>
                </View>
              )}

              <View style={styles.lineDivider} />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Assigned Doctor:</Text>
                <Text style={styles.infoValue}>{ticketData.assignedDoctor}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Room / Location:</Text>
                <Text style={styles.infoValue}>{ticketData.room}</Text>
              </View>
            </View>

            {/* Doctor's Consultation Summary (if discharged) */}
            {ticketData.consultationSummary && (
              <View style={styles.prescriptionCard}>
                <Text style={styles.rxHeader}>📋 Official Clinical Summary & Advice</Text>

                <View style={styles.rxField}>
                  <Text style={styles.rxLabel}>DIAGNOSIS</Text>
                  <Text style={styles.rxValue}>{ticketData.consultationSummary.diagnosis}</Text>
                </View>

                <View style={styles.rxField}>
                  <Text style={styles.rxLabel}>PRESCRIBED MEDICATIONS / PATHWAY</Text>
                  <Text style={[styles.rxValue, { fontFamily: 'monospace' }]}>
                    {ticketData.consultationSummary.prescriptions || 'No oral medications prescribed.'}
                  </Text>
                </View>

                <View style={styles.rxField}>
                  <Text style={styles.rxLabel}>FOLLOW-UP TIMEFRAME</Text>
                  <Text style={styles.rxValue}>{ticketData.consultationSummary.followUpTimeframe}</Text>
                </View>

                {ticketData.consultationSummary.referrals && (
                  <View style={styles.rxField}>
                    <Text style={styles.rxLabel}>DEPARTMENT REFERRAL</Text>
                    <Text style={styles.rxValue}>{ticketData.consultationSummary.referrals}</Text>
                  </View>
                )}
              </View>
            )}

            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={() => fetchTicketDetails(ticketData.ticketNumber)}
            >
              <Text style={styles.refreshButtonText}>↻ Refresh Live Status</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: 6,
    backgroundColor: '#2D6A4F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  hospitalTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  hospitalSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  ipText: {
    color: '#CBD5E1',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  loginContainer: {
    marginTop: 8,
  },
  authToggle: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  toggleTextActive: {
    color: '#0F172A',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 18,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 14,
  },
  quickPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  quickPill: {
    backgroundColor: '#E2ECE9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2D6A4F',
  },
  quickPillText: {
    color: '#2D6A4F',
    fontWeight: '600',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  primaryButton: {
    backgroundColor: '#2D6A4F',
    borderRadius: 8,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  userBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  welcomeText: {
    fontSize: 13,
    color: '#0F172A',
  },
  ticketSub: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'monospace',
  },
  switchButton: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  switchText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  notifBanner: {
    backgroundColor: '#E2ECE9',
    borderWidth: 1,
    borderColor: '#2D6A4F',
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2D6A4F',
    marginBottom: 2,
  },
  notifBody: {
    fontSize: 12,
    color: '#1E293B',
    lineHeight: 18,
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  ticketCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  ticketNumberText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'monospace',
  },
  ticketSubhead: {
    fontSize: 11,
    color: '#64748B',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusGreen: {
    backgroundColor: '#D1FAE5',
  },
  statusAmber: {
    backgroundColor: '#FEF3C7',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F172A',
  },
  lineDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2D6A4F',
    fontFamily: 'monospace',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  verticalDivider: {
    width: 1,
    height: 38,
    backgroundColor: '#E2E8F0',
  },
  concludedBanner: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  concludedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D6A4F',
  },
  concludedSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  prescriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 16,
  },
  rxHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  rxField: {
    marginBottom: 10,
  },
  rxLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  rxValue: {
    fontSize: 13,
    color: '#0F172A',
    marginTop: 2,
    lineHeight: 18,
  },
  refreshButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  refreshButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
});
