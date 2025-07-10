import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    color: "#ffffff",
    fontSize: 60,
    marginBottom: 40,
    textAlign: "center",
    fontWeight: "bold",
  },
  logPanel: {
    borderRadius: 40,
    paddingVertical: 40,
    paddingHorizontal: 40,
    width: "90%",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
    alignItems: "center",
  },
  loginPanelContainer: {
    width: "100%",
    overflow: 'hidden'
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 14,
    marginBottom: 20,
    fontSize: 16,
    width: "100%",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  tab: {
    marginHorizontal: 20,
    fontSize: 18,
    color: "#888",
  },
  activeTab: {
    color: "#1b475d",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  loginButton: {
    backgroundColor: "#888",
    borderRadius: 100,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 12,
  },
  forgotText: {
    color: "#000",
    textAlign: "center",
    fontSize: 14,
    textDecorationLine: "underline",
    marginBottom: 10,
  },
  switchText: {
    color: "#000",
    textAlign: "center",
    textDecorationLine: "underline",
    fontSize: 14,
  },
  selectionContainer: {
  marginBottom: 20,
},
selectionLabel: {
  fontSize: 16,
  fontWeight: '600',
  color: '#333',
  marginBottom: 12,
  marginLeft: 4,
},
optionsContainer: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8,
},
optionButton: {
  paddingVertical: 12,
  paddingHorizontal: 20,
  borderRadius: 25,
  borderWidth: 2,
  borderColor: '#e0e0e0',
  backgroundColor: '#ffffff',
  minWidth: 80,
  alignItems: 'center',
},
optionButtonSelected: {
  borderColor: '#667eea',
  backgroundColor: '#667eea',
},
optionText: {
  fontSize: 14,
  fontWeight: '600',
  color: '#666',
},
optionTextSelected: {
  color: '#ffffff',
},
});

export default styles;
