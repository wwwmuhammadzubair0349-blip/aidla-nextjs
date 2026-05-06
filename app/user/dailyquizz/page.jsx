const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    fontFamily: 'sans-serif',
    backgroundColor: '#f9f9f9',
    color: '#333',
    textAlign: 'center',
    padding: '20px',
  },
  title: {
    fontSize: '3rem',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#666',
  },
  loader: {
    marginTop: '20px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    animation: 'spin 2s linear infinite',
  },
};

export default function DailyQuizz() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>DailyQuizz</h1>
      <p style={styles.subtitle}>Our quiz platform is launching soon. Stay tuned!</p>
      <div style={styles.loader}></div>
    </div>
  );
}
