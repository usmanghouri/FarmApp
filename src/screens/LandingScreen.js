// import React from "react";
// import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import { COLORS, SHADOWS, RADIUS } from "../styles/theme";

// import HeroImage from "../../assets/images/hero.jpg"; // Assuming this path is correct
// import AboutImage from "../../assets/images/about.jpg"; // Assuming this path is correct

// // Simple mobile equivalent of the animated LandingPage hero section.
// // Focuses on the main call-to-action: opening the auth flow.

// export default function LandingScreen() {
//   const navigation = useNavigation();

//   return (
//     <ScrollView style={styles.fullScreenScroll}>
//       {/* Hero Section */}
//       <View style={styles.heroContainer}>
//         <Image source={HeroImage} style={styles.heroImage} />
//         <View style={styles.heroOverlay} />
//         {/* Decorative elements for the hero section */}
//         <View style={styles.heroLeaf1} />
//         <View style={styles.heroLeaf2} />
//         <View style={styles.heroGradient} />

//         <View style={styles.heroContent}>
//           <Text style={styles.heroTitle}>Welcome to FarmConnect</Text>
//           <Text style={styles.heroSubtitle}>
//             Connecting Farmers, Buyers & Suppliers on the go.
//           </Text>
//           <TouchableOpacity style={styles.buttonPrimary} onPress={() => navigation.navigate("Auth")}>
//             <Text style={styles.buttonText}>Get Started</Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Chatbot Button (moved into Hero for better visual flow) */}
//       <TouchableOpacity
//         style={styles.chatbotButton}
//         onPress={() => navigation.navigate("ChatBot")}
//       >
//         <Text style={styles.chatbotButtonText}>Ask FarmConnect Bot</Text>
//       </TouchableOpacity>

//       {/* About Section */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>About Us</Text>
//         <Image source={AboutImage} style={styles.aboutImage} />
//         <Text style={styles.sectionText}>
//           FarmConnect is a revolutionary digital platform designed to bridge the gap between farmers, buyers, and suppliers. Our mission is to create a seamless and transparent agricultural marketplace where all stakeholders can trade efficiently without the interference of middlemen.
//         </Text>
//         <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate("About")}>
//           <Text style={styles.secondaryButtonText}>Learn More</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Contact Section */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Get in Touch</Text>
//         <Text style={styles.sectionText}>
//           Have questions or want to learn more? Reach out to us - we're here to help you grow!
//         </Text>
//         <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate("Contact")}>
//           <Text style={styles.buttonText}>Contact Us</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Footer */}
//       <View style={styles.footer}>
//         <Text style={styles.footerText}>© 2024 FarmConnect. All rights reserved.</Text>
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   fullScreenScroll: {
//     flex: 1,
//     backgroundColor: COLORS.background,
//   },
//   heroContainer: {
//     width: "100%",
//     height: 450,
//     justifyContent: "center",
//     alignItems: "center",
//     position: "relative",
//     overflow: "hidden",
//   },
//   heroImage: {
//     width: "100%",
//     height: "100%",
//     resizeMode: "cover",
//     position: "absolute",
//   },
//   heroOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: "rgba(0,0,0,0.6)",
//   },
//   heroLeaf1: {
//     position: "absolute",
//     top: 50,
//     left: -20,
//     width: 60,
//     height: 60,
//     backgroundColor: COLORS.primary,
//     borderRadius: RADIUS.pill,
//     opacity: 0.3,
//     transform: [{ rotate: "-30deg" }],
//   },
//   heroLeaf2: {
//     position: "absolute",
//     bottom: 30,
//     right: -20,
//     width: 80,
//     height: 80,
//     backgroundColor: COLORS.accent,
//     borderRadius: RADIUS.pill,
//     opacity: 0.2,
//     transform: [{ rotate: "45deg" }],
//   },
//   heroGradient: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundGradient: `linear-gradient(to bottom, transparent, ${COLORS.background})`, // This is conceptual for RN
//     height: "50%", // Only cover bottom half
//     top: "50%",
//     opacity: 0.8,
//   },
//   heroContent: {
//     zIndex: 1,
//     alignItems: "center",
//     paddingHorizontal: 20,
//   },
//   heroTitle: {
//     fontSize: 42,
//     fontWeight: "bold",
//     color: COLORS.surface,
//     marginBottom: 15,
//     textAlign: "center",
//     textShadowColor: "rgba(0,0,0,0.4)",
//     textShadowOffset: { width: 1, height: 1 },
//     textShadowRadius: 3,
//   },
//   heroSubtitle: {
//     fontSize: 18,
//     color: COLORS.surface,
//     textAlign: "center",
//     marginBottom: 30,
//     lineHeight: 25,
//   },
//   section: {
//     padding: 25,
//     alignItems: "center",
//     backgroundColor: COLORS.surface,
//     marginBottom: 15,
//     borderRadius: RADIUS.lg,
//     marginHorizontal: 15,
//     ...SHADOWS.card,
//   },
//   sectionTitle: {
//     fontSize: 28,
//     fontWeight: "bold",
//     color: COLORS.primaryDark,
//     marginBottom: 20,
//   },
//   sectionText: {
//     fontSize: 16,
//     color: COLORS.mutedDark,
//     textAlign: "center",
//     marginBottom: 25,
//     lineHeight: 24,
//   },
//   aboutImage: {
//     width: "100%",
//     height: 220,
//     resizeMode: "cover",
//     borderRadius: RADIUS.md,
//     marginBottom: 25,
//   },
//   buttonPrimary: {
//     backgroundColor: COLORS.primary,
//     paddingVertical: 14,
//     paddingHorizontal: 35,
//     borderRadius: RADIUS.pill,
//     alignItems: "center",
//     minWidth: 180,
//     marginTop: 10,
//     ...SHADOWS.soft,
//   },
//   buttonText: {
//     color: COLORS.surface,
//     fontSize: 17,
//     fontWeight: "bold",
//   },
//   secondaryButton: {
//     borderColor: COLORS.primary,
//     borderWidth: 2,
//     paddingVertical: 14,
//     paddingHorizontal: 35,
//     borderRadius: RADIUS.pill,
//     alignItems: "center",
//     minWidth: 180,
//     marginTop: 15,
//     backgroundColor: COLORS.surface,
//     ...SHADOWS.soft,
//   },
//   secondaryButtonText: {
//     color: COLORS.primary,
//     fontSize: 17,
//     fontWeight: "bold",
//   },
//   footer: {
//     backgroundColor: COLORS.primaryDark,
//     padding: 25,
//     alignItems: "center",
//     marginTop: 30,
//   },
//   footerText: {
//     color: COLORS.surface,
//     fontSize: 13,
//   },
//   chatbotButton: {
//     backgroundColor: COLORS.info,
//     paddingVertical: 14,
//     paddingHorizontal: 35,
//     borderRadius: RADIUS.pill,
//     alignItems: "center",
//     minWidth: 180,
//     marginTop: 15,
//     marginHorizontal: 10,
//     ...SHADOWS.soft,
//   },
//   chatbotButtonText: {
//     color: COLORS.surface,
//     fontSize: 17,
//     fontWeight: "bold",
//   },
// });


import React, { useEffect, useRef }  from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView,Linking, Dimensions,Animated,Easing  } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { COLORS, SHADOWS, RADIUS } from "../styles/theme"; // Assuming these are well-defined
import FontAwesome from 'react-native-vector-icons/FontAwesome'; // Conceptual import for icon, typically use react-native-vector-icons
import { FontAwesome6, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import HeroImage from "../../assets/images/hero.jpg";
import AboutImage from "../../assets/images/about.jpg";

const { width } = Dimensions.get('window');

// For a true mobile-friendly design inspired by the web version.
export default function LandingScreen() {

  
  const navigation = useNavigation();

  // Helper component for the decorative leaf animation (simplified for mobile)
  const LeafDecorator = ({ style, color }) => (
    <View style={[styles.leafBase, style, { backgroundColor: color }]} />
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <Image source={HeroImage} style={styles.heroImage} />
          <View style={styles.heroOverlay} />

          {/* Decorative elements - Simplified */}
          <LeafDecorator style={styles.heroLeaf1} color={COLORS.primary} />
          <LeafDecorator style={styles.heroLeaf2} color={COLORS.accent} />
          {/* Note: Complex gradients/shimmer are hard in RN, use a simple overlay */}

          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Welcome to FarmConnect</Text>
            <Text style={styles.heroSubtitle}>
              Revolutionizing Agriculture by Connecting Farmers, Buyers & Suppliers
            </Text>
            <TouchableOpacity style={styles.buttonPrimary} onPress={() => navigation.navigate("Auth")}>
              <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* --- Stats Section (New) --- */}
        <View style={styles.statsSection}>
          <Text style={styles.statsTitle}>Growing Together. Thriving Together.</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>5k+</Text>
              <Text style={styles.statLabel}>Farmers Connected</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>3.5k+</Text>
              <Text style={styles.statLabel}>Active Buyers</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>10k+</Text>
              <Text style={styles.statLabel}>Products Listed</Text>
            </View>
          </View>
        </View>

        {/* --- About Section (Improved) --- */}
        <View style={styles.section}>
          {/* <Text style={styles.sectionBadge}>About Us</Text> */}
          <Text style={styles.sectionTitle}>About FarmConnect</Text>
          <View style={styles.aboutImageContainer}>
            <Image source={AboutImage} style={styles.aboutImage} />
            <View style={styles.imageBorder} /> 
          </View>
          
          <Text style={styles.sectionText}>
            FarmConnect is a revolutionary digital platform designed to bridge the gap between farmers, buyers, and suppliers. Our mission is to create a seamless and transparent agricultural marketplace where all stakeholders can trade efficiently without the interference of middlemen. By leveraging technology, we empower farmers to sell their products at fair prices, buyers to access fresh and high-quality produce, and suppliers to provide essential farming materials with ease.
          </Text>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => Linking.openURL("https://farmconnect-weld-one.vercel.app/")}>
            <Text style={styles.secondaryButtonText}>Learn More →</Text>
          </TouchableOpacity>
        </View>
        
        {/* --- Features Section (New) --- */}
        <View style={[styles.section, styles.featuresSection]}>
          <Text style={styles.sectionBadge}>Our Features</Text>
          <Text style={styles.sectionTitle}>Why Choose FarmConnect</Text>
          <View style={styles.featuresGrid}>
            {[
              { icon: '🌱', title: "Direct Marketplace", description: "Connect directly with buyers and suppliers." },
              { icon: '📱', title: "Real-Time Updates", description: "Get live market prices and trends." },
              { icon: '🔒', title: "Secure Transactions", description: "Safe and transparent payment system." },
              { icon: '🚚', title: "Logistics Support", description: "Integrated transportation solutions." },
            ].map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <Text style={styles.featureIcon}>{feature.icon}</Text>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            ))}
          </View>
        </View>


        {/* --- Contact Section (Improved) --- */}
        <View style={styles.section}>
          <Text style={styles.sectionBadge}>Contact Us</Text>
          <Text style={styles.sectionTitle}>Get in Touch</Text>
          <Text style={styles.sectionText}>
            Have questions or want to learn more? Reach out to us - we're here to help you grow!
          </Text>
          </View>
         <View style={styles.contactDetailsContainer}>
    {/* Address */}
    <View style={styles.contactItem}>
      <Text style={styles.contactIcon}>📍</Text>
      <View style={styles.contactTextGroup}>
        <Text style={styles.contactTitle}>Our Office</Text>
        <Text style={styles.contactDetail}>123 Farm Road</Text>
        <Text style={styles.contactDetail}>Agricultural City, AC 12345</Text>
      </View>
    </View>
    
    {/* Phone */}
    <View style={styles.contactItem}>
      <Text style={styles.contactIcon}>📞</Text>
      <View style={styles.contactTextGroup}>
        <Text style={styles.contactTitle}>Phone Number</Text>
        <Text style={styles.contactDetail}>+1 (234) 567-8900</Text>
        <Text style={styles.contactDetail}>+1 (987) 654-3210</Text>
      </View>
    </View>

    {/* Email */}
    <View style={styles.contactItem}>
      <Text style={styles.contactIcon}>✉️</Text>
      <View style={styles.contactTextGroup}>
        <Text style={styles.contactTitle}>Email Address</Text>
        <Text style={styles.contactDetail}>info@farmconnect.com</Text>
        <Text style={styles.contactDetail}>support@farmconnect.com</Text>
      </View>
    </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2024 FarmConnect. All rights reserved.</Text>
        </View>
      </ScrollView>

      {/* --- Fixed Chatbot Button (New Position) --- */}
    <TouchableOpacity
  style={styles.fixedChatbotButton}
  onPress={() => navigation.navigate("ChatBot")}
>
  <View style={styles.minimalContainer}>
    <Ionicons name="sparkles" size={20} color="#667eea" />
    <Text style={styles.aiText}>AI</Text>
  </View>
</TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // Global & Scroll Container
  scrollContent: {
    paddingBottom: 20, // Add padding at the bottom for better scroll experience
  },
  
  // --- Hero Section ---
  heroContainer: {
    width: "100%",
    height: 500, // Slightly taller for more visual impact
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    marginBottom: 20, // Add space before the next section
  },
  heroImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    position: "absolute",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  leafBase: { // Base for the decorative leaves
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: RADIUS.pill,
    opacity: 0.2,
  },
  heroLeaf1: { // Reusing leaf styles
    top: 50,
    left: -20,
    transform: [{ rotate: "-30deg" }],
  },
  heroLeaf2: {
    bottom: 30,
    right: -20,
    width: 80,
    height: 80,
    transform: [{ rotate: "45deg" }],
  },
  heroContent: {
    zIndex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  heroTitle: {
    fontSize: 48, // Larger title
    fontWeight: "bold",
    color: COLORS.surface,
    marginBottom: 10,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  heroSubtitle: {
    fontSize: 20, // Larger subtitle
    color: COLORS.surface,
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 28,
  },

  // --- Stats Section ---
  statsSection: {
    backgroundColor: COLORS.primaryDark, // Darker background for contrast
    paddingVertical: 30,
    marginHorizontal: 15,
    borderRadius: RADIUS.lg,
    ...SHADOWS.card,
    marginBottom: 20,
  },
  statsTitle: {
    color: COLORS.surface,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  statCard: {
    alignItems: 'center',
    padding: 10,
    width:'36%'
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.secondary, // Accent color for numbers
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.surface,
    opacity: 0.8,
    marginTop: 5,
  },

  // --- Shared Section Styling ---
  section: {
    padding: 25,
    alignItems: "center",
    backgroundColor: COLORS.surface,
    marginBottom: 20,
    borderRadius: RADIUS.lg,
    marginHorizontal: 15,
    ...SHADOWS.card,
  },
  sectionBadge: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: RADIUS.pill,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 30, // Slightly larger
    fontWeight: "bold",
    color: COLORS.primaryDark,
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionText: {
    fontSize: 16,
    color: COLORS.textDark,
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 24,
  },

  // --- About Section specific ---
  aboutImageContainer: {
    position: 'relative',
    width: '100%',
    marginBottom: 35,
  },
  imageBorder: {
    position: 'absolute',
    top: 10, // Create a border effect similar to the web version
    left: 10,
    right: 10,
    bottom: 10,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.secondaryLight,
    zIndex: 0,
  },
  aboutImage: {
    width: "100%",
    height: 220,
    resizeMode: "cover",
    borderRadius: RADIUS.md,
    position: 'relative',
    zIndex: 1,
    ...SHADOWS.soft,
  },

  // --- Features Section ---
  featuresSection: {
  // Use a lighter background for the section to make cards pop
  backgroundColor: COLORS.secondaryLight, 
  paddingVertical: 50, // More vertical padding for space
},
featuresGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  width: '100%',
  // Increased horizontal padding inside the grid for a buffer
  paddingHorizontal: 5, 
},
featureCard: {
  // Calculate width for two cards, ensuring a 10px gap between them.
  // We use (width - 40) / 2 where 40 accounts for the total horizontal margin (20 on each side of the screen).
  // CRITICAL FIX: To ensure two cards fit perfectly with a gap, we rely on flexWrap and use a fixed margin/padding approach.
  width: '48%', // Ensures two cards take up less than 100%, leaving room for a gap
  backgroundColor: COLORS.surface,
  padding: 20, // Increased padding inside the card
  borderRadius: RADIUS.lg, // Larger border radius for a softer look
  // Use a softer shadow for depth, which is common in web cards
  ...SHADOWS.card, 
  marginBottom: 20, // Increased vertical spacing between rows
  alignItems: 'center',
},
featureIcon: {
  fontSize: 34, // Larger icon
  marginBottom: 10,
  // Add a subtle color highlight to the icon text
  color: COLORS.primaryDark, 
},
featureTitle: {
  fontSize: 18,
  fontWeight: '700', // Use '700' for standard bolding
  color: COLORS.primaryDark,
  textAlign: 'center',
  marginBottom: 5,
},
featureDescription: {
  fontSize: 14,
  color: COLORS.textDark, // Ensure dark text color for readability
  textAlign: 'center',
  lineHeight: 20, // Better line height for mobile reading
},


  // --- Buttons ---
  buttonPrimary: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: RADIUS.pill,
    alignItems: "center",
    minWidth: 200,
    ...SHADOWS.soft,
  },
  buttonText: {
    color: COLORS.surface,
    fontSize: 18,
    fontWeight: "bold",
  },
  secondaryButton: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    paddingVertical: 14,
    paddingHorizontal: 35,
    borderRadius: RADIUS.pill,
    alignItems: "center",
    minWidth: 180,
    marginTop: 15,
    backgroundColor: COLORS.surface,
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 17,
    fontWeight: "bold",
  },
  primaryButton: { // Reused for Contact, to ensure the style is consistent
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: RADIUS.pill,
    alignItems: "center",
    minWidth: 200,
    ...SHADOWS.soft,
    marginTop: 15,
  },

  // --- Footer ---
  footer: {
    backgroundColor: COLORS.primaryDark,
    padding: 30,
    alignItems: "center",
  },
  footerText: {
    color: COLORS.surface,
    fontSize: 14,
    opacity: 0.7,
  },

  // --- Fixed Chatbot Button ---
  fixedChatbotButton: {
    position: 'absolute',
    bottom: 30, // Position on the bottom left
    left: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.info, // Use a distinct color for the chatbot
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.dark, // A more pronounced shadow for a floating button
    zIndex: 100, // Ensure it floats above content
  },
   fixedChatbotButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    zIndex: 1000,
  },
  minimalContainer: {
    backgroundColor: COLORS.surface,
    width: 55,
    height: 55,
    borderRadius: 27.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#667eea',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    flexDirection: 'row',
    gap: 2,
  },
  aiText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  // NEW STYLES for Contact Details
  contactDetailsContainer: {
    width: '100%',
    paddingHorizontal: 0, // Removed extra padding, rely on section's margin
    marginTop: 20, // More space above the list
    marginBottom: 10,
    // Add a subtle border around the whole container for structure
    // borderWidth: 1, 
    // borderColor: COLORS.border, 
    // borderRadius: RADIUS.md, 
    // paddingVertical: 10,
},
contactItem: {
    flexDirection: 'row',
    // Center the icon vertically with the text block
    alignItems: 'center', 
    marginBottom: 20, // Slightly reduced vertical margin for density
    paddingVertical: 15, // Increased vertical padding for space between lines
    // Removed borderBottomWidth to make items look cleaner and rely on marginBottom spacing
    // borderBottomWidth: 1, 
    // borderBottomColor: COLORS.secondaryLight, 
    backgroundColor: COLORS.surface, // Ensure white background for inner card if section background is different
    borderRadius: 8,
    paddingHorizontal: 15, // Padding inside the item
    // Add a light shadow to lift each contact item off the page (subtle card effect)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
},
contactIcon: {
    fontSize: 28, // Slightly larger icon
    marginRight: 15,
    padding: 10, // Larger padding for a more prominent circle
    borderRadius: 25, // Full circle (50% of the 50px width/height)
    backgroundColor: COLORS.primaryLight,
    // Darker icon color for better pop and contrast
    color: COLORS.primaryDark, 
},
contactTextGroup: {
    flex: 1,
    paddingLeft: 5, // Small left padding to separate from the icon circle
},
contactTitle: {
    fontSize: 18,
    fontWeight: '700', // Stronger font weight
    color: COLORS.primaryDark,
    marginBottom: 2, // Tighter spacing to detail lines
},
contactDetail: {
    fontSize: 15,
    color: COLORS.textDark, // Use dark gray for details for better readability than muted
    lineHeight: 20,
},
// --- Section Header (Minor Tweak) ---

sectionTitle: {
    fontSize: 32, // Make title slightly bigger for emphasis
    fontWeight: "800",
    color: COLORS.primaryDark,
    marginBottom: 10, // Tighter to the section text
    textAlign: 'center',
},
sectionText: {
    fontSize: 17, // Slightly larger text
    color: COLORS.textMuted,
    textAlign: "center",
    marginBottom: 30, // More space before the contact items start
    lineHeight: 26,
},
});