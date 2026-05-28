import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SessionListItem } from '@/components/SessionListItem';
import { Colors } from '@/constants/Colors';
import { useSessions } from '@/hooks/useSessions';

export default function HistoryScreen() {
  const { data: sessions, error, isLoading, reload } = useSessions();
  let averageVolume = 0;
  let completionRate = 0;

  if (sessions.length > 0) {
    const totalVolume = sessions.reduce((sum, session) => sum + session.totalVolume, 0);
    const totalSets = sessions.reduce((sum, session) => sum + session.totalSets, 0);
    const completedSets = sessions.reduce((sum, session) => sum + session.completedSets, 0);

    averageVolume = Math.round(totalVolume / sessions.length);
    if (totalSets > 0) {
      completionRate = Math.round((completedSets / totalSets) * 100);
    }
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <FlatList
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={Colors.primary} style={styles.loader} />
          ) : error ? (
            <View style={styles.retryBox}>
              <Text style={styles.body}>Impossible de charger l'historique.</Text>
              <PrimaryButton label="Réessayer" onPress={() => void reload()} />
            </View>
          ) : (
            <EmptyState
              description="Tes séances archivées apparaîtront ici avec le volume et le niveau de complétion."
              title="Pas encore d’historique"
            />
          )
        }
        ListHeaderComponent={
          <View style={styles.hero}>
            <Text style={styles.title}>Archives</Text>
            <Text style={styles.body}>{sessions.length} séances enregistrées.</Text>
            <Text style={styles.body}>Volume moyen : {averageVolume} kg</Text>
            <Text style={styles.body}>Séries complétées : {completionRate}%</Text>
          </View>
        }
        contentContainerStyle={styles.content}
        data={sessions}
        keyExtractor={(item) => item.id.toString()}
        onRefresh={() => void reload()}
        renderItem={({ item }) => <SessionListItem session={item} />}
        refreshing={isLoading}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: {
    color: Colors.mutedText,
    fontSize: 15,
    lineHeight: 22,
  },
  content: {
    paddingBottom: 120,
    paddingHorizontal: 18,
  },
  hero: {
    marginBottom: 22,
    paddingTop: 10,
  },
  loader: {
    marginTop: 32,
  },
  retryBox: {
    marginTop: 24,
  },
  safeArea: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  title: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
  },
});
