require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = "BlastedImage"
  s.version      = package['version']
  s.summary      = package['description']
  s.description  = <<-DESC
                  BlastedImage provides advanced image loading and caching capabilities for React Native projects, leveraging the power of SDWebImage.
                  DESC
  s.homepage     = "https://github.com/xerdnu/react-native-blasted-image"
  s.license      = "MIT"
  s.author       = { "author" => "xerdnu@gmail.com" }
  s.platform     = :ios, "9.0"
  s.source       = { :git => "https://github.com/xerdnu/react-native-blasted-image.git", :tag => s.version.to_s }
  s.source_files = "ios/*.{h,m}"
  s.requires_arc = true

  s.dependency "React-Core"
  s.dependency "SDWebImage"

end
