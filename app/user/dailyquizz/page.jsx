// Main DailyQuizz Component (Default Export for the route)
export default function DailyQuizz() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>DailyQuizz</h1>
      <p style={styles.subtitle}>Our quiz platform is launching soon. Stay tuned!</p>
      <div style={styles.loader}></div>
    </div>
  );
}
