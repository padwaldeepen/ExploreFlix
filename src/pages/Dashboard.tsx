import React from "react";
import { Card, CardMedia, CardContent, Typography } from "@mui/material";
import { moviesData } from "./MovieMockData";

export const MovieCardList = () => {
  return (
    <div style={{ display: "flex", flexWrap: "wrap" }}>
      {moviesData.map((movie, index) => (
        <Card key={index} sx={{ maxWidth: 345, margin: 10 }}>
          <CardMedia
            component="img"
            alt="movie image coming soon"
            height="300"
            image={movie.Poster}
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {movie.Title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {movie.Year}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
