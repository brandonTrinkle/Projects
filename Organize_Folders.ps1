# Define the root Projects directory (where class folders are stored)
$projectsDirectory = Get-Item $PSScriptRoot  # The script's location

# Define file extensions for Papers (documents) and Projects (code)
$papersExtensions = @(".doc", ".docx", ".ppt", ".pptx", ".pdf", ".xls", ".xlsx", ".txt")
$projectsExtensions = @(".py", ".java", ".c", ".cpp", ".cs", ".html", ".js", ".ts", ".php", ".rb", ".swift", ".go", ".sh", ".bat")

# Get all subfolders (each class folder)
$classFolders = Get-ChildItem -Path $projectsDirectory -Directory

foreach ($classFolder in $classFolders) {
    # Define the Papers and Projects folders inside each class folder
    $papersFolder = "$($classFolder.FullName)\Papers"
    $projectsFolder = "$($classFolder.FullName)\Projects"

    # Ensure the target folders exist inside each class folder
    if (!(Test-Path $papersFolder)) { New-Item -ItemType Directory -Path $papersFolder }
    if (!(Test-Path $projectsFolder)) { New-Item -ItemType Directory -Path $projectsFolder }

    # Get all files inside the current class folder (excluding subfolders)
    $files = Get-ChildItem -Path $classFolder.FullName -File

    foreach ($file in $files) {
        $extension = $file.Extension.ToLower()

        # Move documents to Papers
        if ($extension -in $papersExtensions) {
            Move-Item -Path $file.FullName -Destination $papersFolder -Force
            Write-Host "Moved $($file.Name) to $papersFolder"
        }
        # Move coding files to Projects
        elseif ($extension -in $projectsExtensions) {
            Move-Item -Path $file.FullName -Destination $projectsFolder -Force
            Write-Host "Moved $($file.Name) to $projectsFolder"
        }
    }
}

Write-Host "File organization complete!"
