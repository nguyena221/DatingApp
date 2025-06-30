import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#8ebd9d",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    color: "#1b475d",
    fontSize: 40,
    marginBottom: 40,
    textAlign: "center",
    fontWeight: "bold",
  },
  logPanel: {
    backgroundColor: "#eee5c2",
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
    backgroundColor: "#1b475d",
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
    color: "#1b475d",
    textAlign: "center",
    fontSize: 14,
    textDecorationLine: "underline",
    marginBottom: 10,
  },
  switchText: {
    color: "#1b475d",
    textAlign: "center",
    fontSize: 14,
  },
});

export default styles;
