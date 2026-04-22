// server-mpp/src/graphql/schema.js
const { gql } = require('apollo-server-express');
const studentService = require('../services/studentService');

const typeDefs = gql`
  type GradeInfo {
    numeric: Float
    letter: String
  }

  type Subject {
    name: String
    grades: [String]
  }

  type Student {
    id: ID!
    lastName: String!
    firstName: String!
    email: String
    birthDate: String
    cnp: String
    username: String
    uniqueNumber: String
    parentDad: String
    parentMom: String
    mentions: String
    subjects: [Subject]
    finalGrade: String
    averageNumeric: Float
  }

  type PaginatedStudents {
    data: [Student]
    currentPage: Int
    totalPages: Int
    totalItems: Int
  }

  # Definim ce date trimitem când creăm/edităm un elev
  input StudentInput {
    lastName: String!
    firstName: String!
    email: String
    birthDate: String
    cnp: String
    username: String
    uniqueNumber: String
    parentDad: String
    parentMom: String
    mentions: String
  }

  type Query {
    students(page: Int, limit: Int): PaginatedStudents
    student(id: ID!): Student
  }

  type Mutation {
    addGrade(studentId: ID!, subjectName: String!, gradeValue: String!): Student
    removeGrade(studentId: ID!, subjectName: String!, gradeIndex: Int!): Student
    
    # 🚨 MUTAȚIILE NOI PENTRU CRUD ELEVI:
    createStudent(input: StudentInput!): Student
    updateStudent(id: ID!, input: StudentInput!): Student
    deleteStudent(id: ID!): Boolean
  }
`;

const resolvers = {
    Query: {
        students: (_, { page = 1, limit = 20 }) => studentService.getStudentsPaginated(page, limit),
        student: (_, { id }) => studentService.getStudentById(id)
    },
    Mutation: {
        addGrade: (_, { studentId, subjectName, gradeValue }) => studentService.addGrade(studentId, subjectName, gradeValue),
        removeGrade: (_, { studentId, subjectName, gradeIndex }) => studentService.removeGrade(studentId, subjectName, gradeIndex),

        // 🚨 CONECTAREA CU SERVICIUL TĂU (Am schimbat # în // aici)
        createStudent: (_, { input }) => studentService.createStudent(input),
        updateStudent: (_, { id, input }) => studentService.updateStudent(id, input),
        deleteStudent: (_, { id }) => {
            studentService.deleteStudent(id);
            return true;
        }
    }
};

module.exports = { typeDefs, resolvers };