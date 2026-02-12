from pydantic import BaseModel, Field
from typing import List, Optional, Union

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correctAnswer: str

class SubModule(BaseModel):
    subTitle: str
    explanation: str
    examples: Union[str, List[str]]
    videoURL: str
    isCompleted: bool = False

class Module(BaseModel):
    moduleTitle: str
    isCompleted: bool = False
    moduleScore: Optional[float] = 0.0
    subModules: List[SubModule]
    quiz: List[QuizQuestion]

class Course(BaseModel):
    title: str
    description: str
    category: str
    status: str = "active" # active, completed, archived
    totalProgress: float = 0.0
    modules: List[Module]
