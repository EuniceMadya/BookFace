import React from 'react';
import { Redirect, useParams } from 'react-router-dom';


function ClubRedirect() {
  // Get param from url.
  const { clubId } = useParams();

  return (
    <Redirect to={`/club/${clubId}`} />
  );
}


export default ClubRedirect;
