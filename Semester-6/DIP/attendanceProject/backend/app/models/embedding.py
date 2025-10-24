from app import db
from datetime import datetime
import pickle
import numpy as np

class Embedding(db.Model):
    """Embedding model for storing facial embeddings"""
    __tablename__ = 'embeddings'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    model_name = db.Column(db.String(50), nullable=False)  # e.g., 'ArcFace', 'VGG-Face'
    embedding_data = db.Column(db.LargeBinary, nullable=False)  # Serialized numpy array
    embedding_shape = db.Column(db.String(50), nullable=False)  # e.g., '(512,)' for shape
    distance_metric = db.Column(db.String(20), default='cosine')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Index for faster queries
    __table_args__ = (
        db.Index('idx_user_model', 'user_id', 'model_name'),
    )
    
    @property
    def embedding(self):
        """Deserialize embedding data to numpy array"""
        try:
            return pickle.loads(self.embedding_data)
        except Exception as e:
            print(f"Error deserializing embedding: {e}")
            return None
    
    @embedding.setter
    def embedding(self, numpy_array):
        """Serialize numpy array to binary data"""
        if not isinstance(numpy_array, np.ndarray):
            raise ValueError("Embedding must be a numpy array")
        
        self.embedding_data = pickle.dumps(numpy_array, protocol=pickle.HIGHEST_PROTOCOL)
        self.embedding_shape = str(numpy_array.shape)
    
    def get_embedding_array(self):
        """Get embedding as numpy array with proper error handling"""
        return self.embedding
    
    def to_dict(self):
        """Convert embedding object to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'model_name': self.model_name,
            'embedding_shape': self.embedding_shape,
            'distance_metric': self.distance_metric,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<Embedding User:{self.user_id} Model:{self.model_name}>'