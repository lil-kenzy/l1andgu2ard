import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';

interface OnboardingScreenProps {
  navigation: any;
  route: any;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation, route }) => {
  const { role } = route.params || {};
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const onboardingSteps = [
    {
      title: 'Welcome to Landguard',
      description: 'Your trusted platform for buying, selling, and managing land properties',
    },
    {
      title: 'Secure Transactions',
      description: 'All transactions are verified and secured with government-backed verification',
    },
    {
      title: 'Expert Support',
      description: 'Get support from our team of land management experts',
    },
  ];

  const handleFinish = () => {
    const destinations: { [key: string]: string } = {
      buyer: 'BuyerTabs',
      seller: 'SellerTabs',
      admin: 'AdminTabs',
    };
    navigation.replace(destinations[role as string] || 'BuyerTabs');
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={[styles.title, isDark && styles.titleDark]}>
            {onboardingSteps[0].title}
          </Text>
          <Text style={[styles.description, isDark && styles.descriptionDark]}>
            {onboardingSteps[0].description}
          </Text>

          <View style={styles.stepsContainer}>
            {onboardingSteps.map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <View style={[styles.stepNumber, isDark && styles.stepNumberDark]}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={[styles.stepTitle, isDark && styles.stepTitleDark]}>
                    {step.title}
                  </Text>
                  <Text style={[styles.stepDescription, isDark && styles.stepDescriptionDark]}>
                    {step.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.features}>
            <FeatureItem
              title="Verified Properties"
              description="All properties are verified by government authorities"
              isDark={isDark}
            />
            <FeatureItem
              title="Easy Payment"
              description="Multiple payment methods for your convenience"
              isDark={isDark}
            />
            <FeatureItem
              title="Legal Protection"
              description="Full legal documentation and contracts included"
              isDark={isDark}
            />
          </View>

          <Button
            title="Get Started"
            onPress={handleFinish}
            fullWidth
            style={styles.finishButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

interface FeatureItemProps {
  title: string;
  description: string;
  isDark: boolean;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ title, description, isDark }) => (
  <View style={styles.featureItem}>
    <View style={[styles.featureIcon, isDark && styles.featureIconDark]}>
      <Text>✓</Text>
    </View>
    <View style={styles.featureContent}>
      <Text style={[styles.featureTitle, isDark && styles.featureTitleDark]}>
        {title}
      </Text>
      <Text style={[styles.featureDescription, isDark && styles.featureDescriptionDark]}>
        {description}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  containerDark: {
    backgroundColor: '#111827',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  titleDark: {
    color: '#f3f4f6',
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 40,
    lineHeight: 24,
  },
  descriptionDark: {
    color: '#d1d5db',
  },
  stepsContainer: {
    marginBottom: 40,
    gap: 16,
  },
  stepItem: {
    flexDirection: 'row',
    gap: 12,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberDark: {
    backgroundColor: '#1e40af',
  },
  stepNumberText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  stepContent: {
    flex: 1,
    justifyContent: 'center',
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  stepTitleDark: {
    color: '#f3f4f6',
  },
  stepDescription: {
    fontSize: 13,
    color: '#6b7280',
  },
  stepDescriptionDark: {
    color: '#d1d5db',
  },
  features: {
    gap: 12,
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#059669',
    fontWeight: '700',
    fontSize: 20,
  },
  featureIconDark: {
    backgroundColor: '#064e3b',
  },
  featureContent: {
    flex: 1,
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  featureTitleDark: {
    color: '#f3f4f6',
  },
  featureDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
  featureDescriptionDark: {
    color: '#d1d5db',
  },
  finishButton: {
    paddingVertical: 14,
  },
});

export default OnboardingScreen;
