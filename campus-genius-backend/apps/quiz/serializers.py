from rest_framework import serializers
from .models import Quiz, Question, Choice, QuizAttempt, StudentAnswer

class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ['id', 'choice_text', 'is_correct', 'explanation']
        read_only_fields = ('id',)

class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, required=False)

    class Meta:
        model = Question
        fields = ['id', 'question_text', 'question_type', 'marks', 'order', 
                 'code_language', 'code_template', 'test_cases', 'choices']
        read_only_fields = ('id',)

    def create(self, validated_data):
        choices_data = validated_data.pop('choices', [])
        question = Question.objects.create(**validated_data)
        for choice_data in choices_data:
            Choice.objects.create(question=question, **choice_data)
        return question

class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, required=False)
    course_name = serializers.CharField(source='course.title', read_only=True)
    faculty_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model = Quiz
        fields = ['id', 'title', 'course', 'course_name', 'description', 
                 'time_limit', 'total_marks', 'is_published', 'allow_retake',
                 'max_attempts', 'show_correct_answers', 'created_by', 
                 'faculty_name', 'created_at', 'updated_at', 'questions']
        read_only_fields = ('created_by', 'created_at', 'updated_at')

    def create(self, validated_data):
        questions_data = validated_data.pop('questions', [])
        quiz = Quiz.objects.create(**validated_data)
        
        for question_data in questions_data:
            choices_data = question_data.pop('choices', [])
            question = Question.objects.create(quiz=quiz, **question_data)
            
            for choice_data in choices_data:
                Choice.objects.create(question=question, **choice_data)
                
        return quiz

class StudentAnswerSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.question_text', read_only=True)
    question_type = serializers.CharField(source='question.question_type', read_only=True)
    question_marks = serializers.IntegerField(source='question.marks', read_only=True)

    class Meta:
        model = StudentAnswer
        fields = ['id', 'question', 'question_text', 'question_type', 
                 'question_marks', 'selected_option', 'text_answer',
                 'code_answer', 'file_answer', 'is_correct', 
                 'marks_obtained', 'feedback']
        read_only_fields = ('is_correct', 'marks_obtained', 'feedback')

class QuizAttemptSerializer(serializers.ModelSerializer):
    answers = StudentAnswerSerializer(many=True, required=False)
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)
    
    class Meta:
        model = QuizAttempt
        fields = ['id', 'quiz', 'quiz_title', 'student', 'student_name',
                 'started_at', 'completed_at', 'score', 'is_passed',
                 'attempt_number', 'answers']
        read_only_fields = ('student', 'started_at', 'score', 'is_passed',
                           'attempt_number')

    def create(self, validated_data):
        answers_data = validated_data.pop('answers', [])
        attempt = QuizAttempt.objects.create(**validated_data)
        for answer_data in answers_data:
            StudentAnswer.objects.create(attempt=attempt, **answer_data)
        return attempt
