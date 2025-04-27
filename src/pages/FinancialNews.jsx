import { useState, useEffect } from "react";
import { Carousel, Image } from "react-bootstrap";

const FinancialNews = () => {
  const [news, setNews] = useState([]);
  const apiKey = "3fda8ceb53d34e8db235a812a98be558"; // API key di NewsAPI
  const apiUrl = "https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=";

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(apiUrl + apiKey);
        if (!response.ok) {
          throw new Error(`Errore API News: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        console.log("DEBUG - Dati NewsAPI ricevuti:", data);
        if (data.articles && data.articles.length > 0) {
          setNews(data.articles.slice(0, 5)); // Mostra le prime 5 notizie
        }
      } catch (error) {
        console.error("Errore nel recupero delle notizie:", error);
      }
    };

    fetchNews();
  }, [apiKey, apiUrl]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" };
    return date.toLocaleDateString("it-IT", options);
  };

  return (
    <div style={{ overflow: "hidden" }}>
      {" "}
      {/* Contenitore con overflow hidden */}
      {news.length > 0 ? (
        <div style={{ height: "27vh" }}>
          {" "}
          {/* Altezza fissa per il carosello */}
          <Carousel interval={6000} pause={false}>
            {news.map((article, index) => (
              <Carousel.Item key={index}>
                <div
                  className="d-flex align-items-center"
                  style={{ backgroundColor: "#f8f9fa", padding: "20px", borderRadius: "5px" }}
                >
                  {article.urlToImage && (
                    <div
                      style={{
                        marginRight: "20px",
                        maxWidth: "200px",
                        height: "15vh",
                        overflow: "hidden",
                      }}
                    >
                      <Image
                        src={article.urlToImage}
                        alt={article.title}
                        fluid
                        rounded
                        style={{ objectFit: "cover", height: "100%" }}
                      />
                    </div>
                  )}
                  <div>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <h3>{article.title}</h3>
                    </a>
                    <p>{article.description}</p>
                    <p className="text-muted">
                      Fonte: {article.source.name} - Pubblicato il: {formatDate(article.publishedAt)}
                    </p>
                  </div>
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
        </div>
      ) : (
        <p>Caricamento delle ultime notizie...</p>
      )}
    </div>
  );
};

export default FinancialNews;
