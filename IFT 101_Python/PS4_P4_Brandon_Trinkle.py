'''
Name: Brandon Trinkle
Student ID: 1217455031
Course: IFT 101
Problem Set: PS4
Problem: P4
Date: 11/4/2023
'''

paragraph = "Python is a high-level, general-purpose programming language. It was created by Guido van Rossum and first released in 1991. Python's design philosophy emphasizes code readability with its notable use of significant indentation. Its language constructs and object-oriented approach aim to help programmers write clear, logical code for small and large-scale projects."

sentences = paragraph.split('. ')
for i in range(len(sentences)-1):
    sentences[i] += '.'

print('\nList of Sentences:',sentences)

print('\nFirst sentence:',sentences[0])
print('\nLast sentence:',sentences[-1])

sentences[0] = sentences[0].upper()
sentences[-1] = sentences[-1].upper()
print('\nFirst sentence with uppercase:',sentences[0])
print('\nLast sentence with uppercase:',sentences[-1])

final_paragraph = ' '.join(sentences)
print('\nJoined paragraph:',final_paragraph)

print('\nFirst 20 characters of the paragraph:',final_paragraph[:20])

print("\nCount of 'code':",final_paragraph.count('code'))

print("\nFirst position of 'Python':",final_paragraph.index('Python'))

final_paragraph = final_paragraph.replace('Python', 'PY')
print("\nParagraph with 'Python' replaced by 'PY':",final_paragraph)

last_sentence = sentences[-1].split(' ')
last_sentence.reverse()
reversed_sentence = ' '.join(last_sentence)
print("\nReversed order of words in the last sentence:",reversed_sentence)