import React, { useState } from "react";
import { Container, Form, Button, Modal, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const API_ENDPOINT =
  "https://xdwvg9no7pefghrn.us-east-1.aws.endpoints.huggingface.cloud";

function App() {
  const [showModal, setShowModal] = useState(false);
  const [comicImages, setComicImages] = useState([]);
  const [sentences, setSentences] = useState(Array(10).fill(""));
  const [imageURLs, setImageURLs] = useState([]);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    try {
      const images = await Promise.all(sentences.map(generateImage));
      setComicImages(images);

      const urls = await Promise.all(
        images.map((imageBlob) => getImageURL(imageBlob))
      );
      setImageURLs(urls);

      setShowModal(true);
      setFormSubmitted(false);
    } catch (error) {
      console.error("Error generating images:", error);
    }
  };

  const generateImage = async (text) => {
    const data = { inputs: text };
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "image/png",
        Authorization:
          "Bearer VknySbLLTUjbxXAXCjyfaFIPwUTCeRXbFSOjwRiCxsxFyhbnGjSFalPKrpvvDAaPVzWEevPljilLVDBiTzfIbWFdxOkYJxnOPoHhkkVGzAknaOulWggusSFewzpqsNWM", // Replace with your API key
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate image: ${response.statusText}`);
    }

    return response.blob();
  };

  const getImageURL = (blob) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setComicImages([]);
  };

  const getRandomPositionClass = () => {
    const positions = ["bottom-left", "bottom-right", "top-left", "top-right"];
    return positions[Math.floor(Math.random() * positions.length)];
  };

  return (
    <>
      <div className="heading">Toon Toon</div>
      <Container fluid className="App">
        <div className="form-card">
          <Form onSubmit={handleSubmit}>
            <div>
              <Row style={{ justifyContent: "center" }}>
                {[...Array(5)].map((_, rowIndex) => (
                  <Row
                    key={rowIndex}
                    className="mb-3"
                    style={{
                      justifyContent: "center",
                    }}
                  >
                    {[...Array(2)].map((_, colIndex) => {
                      const index = rowIndex * 2 + colIndex;
                      return (
                        <Col key={colIndex} xs={12} md={6}>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder={`Enter comic text ${index + 1}`}
                            value={sentences[index]}
                            onChange={(e) => {
                              const updatedSentences = [...sentences];
                              updatedSentences[index] = e.target.value;
                              setSentences(updatedSentences);
                            }}
                            required
                          />
                        </Col>
                      );
                    })}
                  </Row>
                ))}
              </Row>
            </div>
            <Button
              type="submit"
              variant="primary"
              style={{ background: "#fc8019", color: "#fff", border: "none" }}
              disabled={formSubmitted}
            >
              {formSubmitted ? "Generating..." : "Generate Comic"}
            </Button>
          </Form>
        </div>

        <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
          <Modal.Body>
            {comicImages.map((panel, index) => (
              <div
                key={index}
                className={`comic-panel ${getRandomPositionClass()}`}
              >
                <img
                  src={imageURLs[index]}
                  alt={`Panel ${index + 1}`}
                  className="comic-img"
                />
                <div
                  className={`bubble circular-random ${getRandomPositionClass()}`}
                  style={{ transform: `rotate(${Math.random() * 20 - 10}deg)` }}
                >
                  {sentences[index]}
                </div>
              </div>
            ))}
          </Modal.Body>
        </Modal>
      </Container>
    </>
  );
}

export default App;
