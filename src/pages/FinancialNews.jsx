import { useState, useEffect } from "react";
import { Carousel, Image } from "react-bootstrap";
import { fetchFinancialNews } from "../service/apiService";

const FinancialNews = () => {
  const [news, setNews] = useState([]);

  useEffect(() => {
    const getFinancialNews = async () => {
      try {
        const articles = await fetchFinancialNews();
        if (articles && articles.length > 0) {
          setNews(articles.slice(0, 6)); //  prime 6 notizie
        }
      } catch (error) {
        console.error("Errore nel recupero delle notizie:", error);
      }
    };

    getFinancialNews();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleDateString("it-IT", options);
  };

  return (
    <div
      style={{
        overflow: "hidden",
        backgroundColor: "#2d3748",
        padding: "20px",
        borderRadius: "5px",
      }}
    >
      {news.length > 0 ? (
        <div style={{ height: "27vh" }}>
          <Carousel
            interval={6000}
            pause={false}
            controls={false} // Rimuovo le frecce
            indicators={false} // Rimuovo gli indicatori
          >
            {news.map((article, index) => (
              <Carousel.Item key={index}>
                <div className="d-flex align-items-center">
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
                      <h3 style={{ color: "#fff" }}>{article.title}</h3>
                    </a>
                    <p style={{ color: "#e2e8f0" }}>{article.description}</p>
                    <p className="text-light">
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
