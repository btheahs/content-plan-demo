import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Grid, Card, CardMedia, CardContent, Typography, Chip } from '@mui/material';

const Files = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get('https://btheahs--content-plan-app-fastapi-app-dev.modal.run/files');
        console.log("response")
        setImages(response.data);
      } catch (err) {
        setError('Failed to load images');
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Grid container spacing={2}>
      {images.map((image, index) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
          <Card>
            <CardMedia
              component="img"
              height="140"
              image={image.url}
              alt={image.name}
            />
            <CardContent>
              <Typography gutterBottom variant="h6" component="div">
                {image.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {image.size}
              </Typography>
              {image.tags.map((tag, tagIndex) => (
                <Chip key={tagIndex} label={tag} size="small" style={{ margin: '2px' }} />
              ))}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default Files;