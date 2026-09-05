export function errorHandler(error,req,res,next) {
  if (res.headersSent) return next(error);
  const status = error.code==='LIMIT_FILE_SIZE' ? 413 : error.name==='MulterError' ? 422 : error.code==='ER_DUP_ENTRY' ? 409 : error.code==='ER_NO_REFERENCED_ROW_2' ? 422 : error.status || 500;
  if (status>=500) console.error('[api]',error.code || error.name,error.message);
  const message=status>=500 ? 'Service temporairement indisponible. Réessayez dans quelques instants.' : error.code==='ER_DUP_ENTRY' ? 'Cette valeur existe déjà.' : error.code==='ER_NO_REFERENCED_ROW_2' ? 'Le client sélectionné n’existe plus.' : error.code==='LIMIT_FILE_SIZE' ? 'L’image ne doit pas dépasser 5 Mo.' : error.message;
  res.status(status).json({success:false,message});
}
